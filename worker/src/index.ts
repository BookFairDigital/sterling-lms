export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
  BOOTSTRAP_SECRET: string;
  ALLOWED_ORIGIN?: string;
}
type User = { id:string; email:string; full_name:string; role:string; status:string };
const json=(data:unknown,status=200,headers:HeadersInit={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const bytes=(n:number)=>crypto.getRandomValues(new Uint8Array(n));
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
const hash=async(s:string)=>hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));
const passwordHash=async(password:string,salt:string)=>{const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);return hex(await crypto.subtle.deriveBits({name:"PBKDF2",salt:Uint8Array.from(salt.match(/.{2}/g)!.map(x=>parseInt(x,16))),iterations:210000,hash:"SHA-256"},key,256));};
const cookie=(token:string,maxAge:number)=>`sterling_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
function originAllowed(request:Request,env:Env){const origin=request.headers.get("Origin");const allowed=(env.ALLOWED_ORIGIN||"https://bookfairdigital.github.io").split(",").map(x=>x.trim());return !origin||allowed.includes(origin);}
function cors(request:Request,env:Env){const origin=request.headers.get("Origin")||"";return {"access-control-allow-origin":originAllowed(request,env)&&origin?origin:(env.ALLOWED_ORIGIN||"https://bookfairdigital.github.io").split(",")[0],"access-control-allow-credentials":"true","access-control-allow-methods":"GET,POST,PUT,PATCH,DELETE,OPTIONS","access-control-allow-headers":"Content-Type","vary":"Origin"};}
async function currentUser(request:Request,env:Env):Promise<User|null>{const token=request.headers.get("Cookie")?.match(/(?:^|; )sterling_session=([^;]+)/)?.[1];if(!token)return null;const row=await env.DB.prepare("SELECT u.id,u.email,u.full_name,u.role,u.status FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>CURRENT_TIMESTAMP AND u.status='active'").bind(await hash(token)).first<User>();return row||null;}
const body=async(r:Request)=>{try{return await r.json() as Record<string,unknown>}catch{return null}};
export default {async fetch(request:Request,env:Env):Promise<Response>{
 const headers=cors(request,env);const url=new URL(request.url);const path=url.pathname.replace(/\/$/,"")||"/";
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(!originAllowed(request,env))return json({error:"Origin not allowed"},403);
 try{
  if(path==="/health"&&request.method==="GET")return json({ok:true,service:"Sterling LMS API",time:new Date().toISOString()},200,headers);
  if(path==="/auth/bootstrap"&&request.method==="POST"){
   const input=await body(request);if(!input||typeof input.secret!=="string"||input.secret!==env.BOOTSTRAP_SECRET)return json({error:"Invalid setup credentials"},403,headers);
   const email=String(input.email||"").trim().toLowerCase(),password=String(input.password||""),name=String(input.full_name||"Administrator").trim();
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12)return json({error:"Valid email and password of at least 12 characters required"},400,headers);
   const admins=await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin'").first<{n:number}>();if((admins?.n||0)>0)return json({error:"Admin setup is already completed"},409,headers);
   const invite=await env.DB.prepare("SELECT id FROM admin_invites WHERE email=? AND role='admin' AND status='pending'").bind(email).first();if(!invite)return json({error:"Email is not on the admin invite list"},403,headers);
   const id=crypto.randomUUID(),salt=hex(bytes(16).buffer),pwh=await passwordHash(password,salt);
   await env.DB.batch([env.DB.prepare("INSERT INTO users (id,full_name,email,password_hash,role,status) VALUES (?,?,?,?,'admin','active')").bind(id,name,email,salt+":"+pwh),env.DB.prepare("UPDATE admin_invites SET status='accepted' WHERE email=?").bind(email)]);
   return json({ok:true,message:"Admin account created. You can now sign in."},201,headers);
  }
  if(path==="/auth/login"&&request.method==="POST"){
   const input=await body(request);const email=String(input?.email||"").trim().toLowerCase(),password=String(input?.password||"");
   const user=await env.DB.prepare("SELECT id,email,full_name,role,status,password_hash FROM users WHERE email=?").bind(email).first<User&{password_hash:string}>();
   if(!user||user.status!=="active"||!user.password_hash)return json({error:"Invalid email or password"},401,headers);
   const [salt,stored]=user.password_hash.split(":");if(!salt||await passwordHash(password,salt)!==stored)return json({error:"Invalid email or password"},401,headers);
   const token=hex(bytes(32).buffer),expiry=new Date(Date.now()+7*86400000).toISOString();
   await env.DB.prepare("INSERT INTO sessions (id,user_id,token_hash,expires_at) VALUES (?,?,?,?)").bind(crypto.randomUUID(),user.id,await hash(token),expiry).run();
   return json({user:{id:user.id,email:user.email,full_name:user.full_name,role:user.role}},200,{...headers,"set-cookie":cookie(token,604800)});
  }
  if(path==="/auth/me"&&request.method==="GET"){const user=await currentUser(request,env);return user?json({user},200,headers):json({error:"Unauthenticated"},401,headers);}
  if(path==="/auth/logout"&&request.method==="POST"){const token=request.headers.get("Cookie")?.match(/(?:^|; )sterling_session=([^;]+)/)?.[1];if(token)await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await hash(token)).run();return json({ok:true},200,{...headers,"set-cookie":cookie("",0)});}
  const user=await currentUser(request,env);if(!user)return json({error:"Sign in required"},401,headers);
  if(user.role!=="admin"&&user.role!=="lecturer")return json({error:"Insufficient permissions"},403,headers);
  if(path==="/api/dashboard"&&request.method==="GET"){
   const [students,courses,payments,classes]=await Promise.all([
    env.DB.prepare("SELECT COUNT(*) n FROM users WHERE role='student'").first<{n:number}>(),
    env.DB.prepare("SELECT COUNT(*) n FROM courses WHERE status='published'").first<{n:number}>(),
    env.DB.prepare("SELECT COUNT(*) n FROM payments WHERE status='pending'").first<{n:number}>(),
    env.DB.prepare("SELECT COUNT(*) n FROM zoom_classes WHERE starts_at>=CURRENT_TIMESTAMP").first<{n:number}>()
   ]);return json({students:students?.n||0,courses:courses?.n||0,pending_payments:payments?.n||0,upcoming_classes:classes?.n||0},200,headers);
  }
  const collections:Record<string,string>={"/api/students":"SELECT id,student_number,full_name,email,phone,status,created_at FROM users WHERE role='student' ORDER BY created_at DESC","/api/courses":"SELECT * FROM courses ORDER BY created_at DESC","/api/zoom-classes":"SELECT z.*,c.title AS course_title FROM zoom_classes z LEFT JOIN courses c ON c.id=z.course_id ORDER BY z.starts_at DESC","/api/payments":"SELECT p.*,u.full_name AS student_name,c.title AS course_title FROM payments p LEFT JOIN users u ON u.id=p.student_id LEFT JOIN courses c ON c.id=p.course_id ORDER BY p.created_at DESC","/api/announcements":"SELECT * FROM announcements ORDER BY created_at DESC"};
  if(request.method==="GET"&&collections[path]){const result=await env.DB.prepare(collections[path]).all();return json(result.results,200,headers);}
  return json({error:"Route not found"},404,headers);
 }catch(error){return json({error:"Internal server error"},500,headers);}
}};
