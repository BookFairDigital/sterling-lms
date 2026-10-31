const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
const hash=async s=>hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));
const random=n=>crypto.getRandomValues(new Uint8Array(n));
const pwHash=async(p,s)=>{const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(p),"PBKDF2",false,["deriveBits"]);const salt=Uint8Array.from(s.match(/.{2}/g).map(x=>parseInt(x,16)));return hex(await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:210000,hash:"SHA-256"},k,256));};
const cookie=(t,a)=>`sterling_session=${t}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${a}`;
const getBody=async r=>{try{return await r.json()}catch{return null}};
async function userFor(r,env){const t=r.headers.get("Cookie")?.match(/(?:^|; )sterling_session=([^;]+)/)?.[1];if(!t)return null;return await env.DB.prepare("SELECT u.id,u.email,u.full_name,u.role,u.status FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>CURRENT_TIMESTAMP AND u.status='active'").bind(await hash(t)).first();}
export default {async fetch(req,env){
 const origin=req.headers.get("Origin")||"",ownOrigin=new URL(req.url).origin,allowed=[...(env.ALLOWED_ORIGIN||"https://bookfairdigital.github.io").split(",").map(x=>x.trim()),ownOrigin];
 const h={"access-control-allow-origin":allowed.includes(origin)?origin:allowed[0],"access-control-allow-credentials":"true","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"Content-Type","vary":"Origin"};
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:h});
 if(origin&&!allowed.includes(origin))return json({error:"Origin not allowed"},403,h);
 const path=new URL(req.url).pathname.replace(/\/$/,"")||"/";
 try{
 if(path==="/setup"&&req.method==="GET"){
  const page=`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sterling LMS · First Admin Setup</title><style>body{font:15px system-ui;background:#eef3f9;margin:0;display:grid;min-height:100vh;place-items:center;color:#142b43}.card{background:white;padding:28px;border-radius:16px;width:min(92vw,440px);box-shadow:0 12px 40px #1232}h1{margin:0 0 8px}p{color:#617187;font-size:13px}label{display:block;font-weight:650;font-size:13px;margin:14px 0 6px}input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:8px;font:inherit}button{margin-top:20px;width:100%;padding:13px;border:0;border-radius:8px;background:#1764d8;color:white;font-weight:700;font-size:14px;cursor:pointer}#msg{white-space:pre-wrap;margin-top:14px;font-size:13px}</style><main class="card"><h1>Sterling LMS</h1><b>First Administrator Setup</b><p>Use the invited administrator email. Your setup secret and password are sent securely to this API and are not saved in this page.</p><form id="f"><label>Full name</label><input name="full_name" required autocomplete="name"><label>Invited email</label><input name="email" type="email" required value="n.imethdm@gmail.com" autocomplete="username"><label>Setup secret</label><input name="secret" type="password" required autocomplete="off"><label>New password (12+ characters)</label><input name="password" type="password" minlength="12" required autocomplete="new-password"><label>Confirm password</label><input name="confirm" type="password" minlength="12" required autocomplete="new-password"><button>Create administrator account</button></form><div id="msg" role="status"></div></main><script>const f=document.querySelector('#f'),m=document.querySelector('#msg');f.addEventListener('submit',async e=>{e.preventDefault();m.textContent='Creating account…';const d=Object.fromEntries(new FormData(f));if(d.password!==d.confirm){m.textContent='Passwords do not match.';return}try{const r=await fetch('/auth/bootstrap',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({full_name:d.full_name,email:d.email,secret:d.secret,password:d.password})});const j=await r.json();if(!r.ok)throw Error(j.error||'Setup failed');f.reset();m.textContent='Administrator account created successfully. You can now use the Admin sign-in page once the LMS frontend is connected.'}catch(x){m.textContent=x.message||'Setup failed. Please try again.'}});</script></html>`;
  return new Response(page,{status:200,headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
 }
 if(path==="/health")return json({ok:true,service:"Sterling LMS API"},200,h);
 if(path==="/auth/bootstrap"&&req.method==="POST"){
  const b=await getBody(req);if(!b||b.secret!==env.BOOTSTRAP_SECRET||!env.BOOTSTRAP_SECRET)return json({error:"Invalid setup credentials"},403,h);
  const email=String(b.email||"").trim().toLowerCase(),password=String(b.password||""),name=String(b.full_name||"Administrator");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12)return json({error:"Valid email and password (12+ characters) required"},400,h);
  const n=await env.DB.prepare("SELECT COUNT(*) n FROM users WHERE role='admin'").first();if(n.n)return json({error:"Admin setup already completed"},409,h);
  const invite=await env.DB.prepare("SELECT id FROM admin_invites WHERE email=? AND role='admin' AND status='pending'").bind(email).first();if(!invite)return json({error:"Email not invited"},403,h);
  const salt=hex(random(16).buffer),digest=await pwHash(password,salt);
  await env.DB.prepare("INSERT INTO users(id,full_name,email,password_hash,role,status) VALUES(?,?,?,?,'admin','active')").bind(crypto.randomUUID(),name,email,salt+":"+digest).run();
  await env.DB.prepare("UPDATE admin_invites SET status='accepted' WHERE email=?").bind(email).run();
  return json({ok:true},201,h);
 }
 if(path==="/auth/login"&&req.method==="POST"){
  const b=await getBody(req),email=String(b?.email||"").trim().toLowerCase(),password=String(b?.password||"");
  const u=await env.DB.prepare("SELECT id,email,full_name,role,status,password_hash FROM users WHERE email=?").bind(email).first();
  if(!u||u.status!=="active"||!u.password_hash)return json({error:"Invalid email or password"},401,h);
  const [salt,digest]=u.password_hash.split(":");if(!salt||await pwHash(password,salt)!==digest)return json({error:"Invalid email or password"},401,h);
  const token=hex(random(32).buffer),expires=new Date(Date.now()+604800000).toISOString();
  await env.DB.prepare("INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(),u.id,await hash(token),expires).run();
  return json({user:{id:u.id,email:u.email,full_name:u.full_name,role:u.role}},200,{...h,"set-cookie":cookie(token,604800)});
 }
 if(path==="/auth/me"&&req.method==="GET"){const u=await userFor(req,env);return u?json({user:u},200,h):json({error:"Sign in required"},401,h);}
 if(path==="/auth/logout"&&req.method==="POST"){const t=req.headers.get("Cookie")?.match(/(?:^|; )sterling_session=([^;]+)/)?.[1];if(t)await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await hash(t)).run();return json({ok:true},200,{...h,"set-cookie":cookie("",0)});}
 const u=await userFor(req,env);if(!u)return json({error:"Sign in required"},401,h);if(!["admin","lecturer"].includes(u.role))return json({error:"Forbidden"},403,h);
 if(path==="/api/dashboard"){const q=await Promise.all(["SELECT COUNT(*) n FROM users WHERE role='student'","SELECT COUNT(*) n FROM courses WHERE status='published'","SELECT COUNT(*) n FROM payments WHERE status='pending'","SELECT COUNT(*) n FROM zoom_classes WHERE starts_at>=CURRENT_TIMESTAMP"].map(s=>env.DB.prepare(s).first()));return json({students:q[0].n,courses:q[1].n,pending_payments:q[2].n,upcoming_classes:q[3].n},200,h);}
 const sql={"/api/students":"SELECT id,student_number,full_name,email,phone,status,created_at FROM users WHERE role='student' ORDER BY created_at DESC","/api/courses":"SELECT * FROM courses ORDER BY created_at DESC","/api/zoom-classes":"SELECT z.*,c.title course_title FROM zoom_classes z LEFT JOIN courses c ON c.id=z.course_id ORDER BY z.starts_at DESC","/api/payments":"SELECT p.*,u.full_name student_name,c.title course_title FROM payments p LEFT JOIN users u ON u.id=p.student_id LEFT JOIN courses c ON c.id=p.course_id ORDER BY p.created_at DESC","/api/announcements":"SELECT * FROM announcements ORDER BY created_at DESC"};
 if(req.method==="GET"&&sql[path]){const result=await env.DB.prepare(sql[path]).all();return json(result.results,200,h);}
 return json({error:"Route not found"},404,h);
 }catch(e){console.error("Sterling LMS API error:",e);if(path==="/auth/bootstrap")return json({error:"Admin setup failed",detail:String(e?.message||e)},500,h);return json({error:"Internal server error"},500,h);}
}};
