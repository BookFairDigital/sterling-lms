const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
const hash=async s=>hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));
const random=n=>crypto.getRandomValues(new Uint8Array(n));
const pwHash=async(p,s)=>{const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(p),"PBKDF2",false,["deriveBits"]);const salt=Uint8Array.from(s.match(/.{2}/g).map(x=>parseInt(x,16)));return hex(await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:100000,hash:"SHA-256"},k,256));};
const cookie=(t,a)=>`sterling_session=${t}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${a}`;
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
  const page=`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sterling LMS · First Admin Setup</title><style>body{font:15px system-ui;background:#eef3f9;margin:0;display:grid;min-height:100vh;place-items:center;color:#142b43}.card{background:white;padding:28px;border-radius:16px;width:min(92vw,440px);box-shadow:0 12px 40px #1232}h1{margin:0 0 8px}p{color:#617187;font-size:13px}label{display:block;font-weight:650;font-size:13px;margin:14px 0 6px}input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:8px;font:inherit}button{margin-top:20px;width:100%;padding:13px;border:0;border-radius:8px;background:#1764d8;color:white;font-weight:700;font-size:14px;cursor:pointer}#msg{white-space:pre-wrap;margin-top:14px;font-size:13px}</style><main class="card"><h1>Sterling LMS</h1><b>First Administrator Setup</b><p>Use the invited administrator email. Your setup secret and password are sent securely to this API and are not saved in this page.</p><form id="f"><label>Full name</label><input name="full_name" required autocomplete="name"><label>Invited email</label><input name="email" type="email" required value="n.imethdm@gmail.com" autocomplete="username"><label>Setup secret</label><input name="secret" type="password" required autocomplete="off"><label>New password (12+ characters)</label><input name="password" type="password" minlength="12" required autocomplete="new-password"><label>Confirm password</label><input name="confirm" type="password" minlength="12" required autocomplete="new-password"><button>Create administrator account</button></form><div id="msg" role="status"></div></main><script>const f=document.querySelector('#f'),m=document.querySelector('#msg');f.addEventListener('submit',async e=>{e.preventDefault();m.textContent='Creating account…';const d=Object.fromEntries(new FormData(f));if(d.password!==d.confirm){m.textContent='Passwords do not match.';return}try{const r=await fetch('/auth/bootstrap',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({full_name:d.full_name,email:d.email,secret:d.secret,password:d.password})});const j=await r.json();if(!r.ok)throw Error((j.error||'Setup failed')+(j.detail?': '+j.detail:''));f.reset();m.textContent='Administrator account created successfully. You can now use the Admin sign-in page once the LMS frontend is connected.'}catch(x){m.textContent=x.message||'Setup failed. Please try again.'}});</script></html>`;
  return new Response(page,{status:200,headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
 }
 if(path==="/auth/admin-reset"&&req.method==="POST"){
  const b=await getBody(req);
  if(!b||!env.BOOTSTRAP_SECRET||b.secret!==env.BOOTSTRAP_SECRET)return json({error:"Invalid setup credentials"},403,h);
  const email=String(b.email||"").trim().toLowerCase(),password=String(b.password||"");
  if(password.length<12)return json({error:"Password must be at least 12 characters"},400,h);
  const u=await env.DB.prepare("SELECT id FROM users WHERE email=? AND role='admin' AND status='active'").bind(email).first();
  if(!u)return json({error:"Active administrator not found"},404,h);
  const salt=hex(random(16).buffer),digest=await pwHash(password,salt);
  await env.DB.prepare("UPDATE users SET password_hash=? WHERE id=?").bind(salt+":"+digest,u.id).run();
  await env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(u.id).run();
  return json({ok:true},200,h);
 }
 if(path==="/admin-password-reset"&&req.method==="GET"){
  const html='<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sterling LMS Password Reset</title><style>body{font:15px system-ui;background:#eef3f9;display:grid;place-items:center;min-height:100vh;margin:0;color:#142b43}.card{background:white;padding:26px;border-radius:14px;width:min(90vw,420px)}label{display:block;margin:14px 0 5px;font-weight:600}input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #ccd5e1;border-radius:8px}button{width:100%;padding:13px;margin-top:18px;background:#1764d8;color:white;border:0;border-radius:8px;font-weight:bold}#msg{margin-top:14px;font-size:13px}</style><main class="card"><h2>Sterling LMS</h2><b>Admin password reset</b><p>Set a new password for the invited administrator. Keep the setup secret private.</p><form id="f"><label>Email</label><input name="email" type="email" value="n.imethdm@gmail.com" required><label>Cloudflare BOOTSTRAP_SECRET</label><input name="secret" type="password" required><label>New password (12+ characters)</label><input name="password" type="password" minlength="12" required><label>Confirm password</label><input name="confirm" type="password" minlength="12" required><button>Save new password</button></form><div id="msg"></div></main><script>const f=document.querySelector("#f"),m=document.querySelector("#msg");f.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));if(d.password!==d.confirm){m.textContent="Passwords do not match";return}m.textContent="Saving…";try{const r=await fetch("/auth/admin-reset",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:d.email,secret:d.secret,password:d.password})});const j=await r.json();if(!r.ok)throw Error(j.error||"Reset failed");f.reset();m.textContent="Password updated. Return to Sterling LMS login and sign in with the new password."}catch(x){m.textContent=x.message||"Reset failed"}};</script></html>';
  return new Response(html,{status:200,headers:{"content-type":"text/html;charset=utf-8","cache-control":"no-store"}});
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
  const u=await env.DB.prepare("SELECT id,email,full_name,role,status,password_hash FROM users WHERE lower(email)=? OR student_number=? LIMIT 1").bind(email,String(b?.email||"").trim()).first();
  if(!u||u.status!=="active"||!u.password_hash)return json({error:"Invalid email or password"},401,h);
  const [salt,digest]=u.password_hash.split(":");if(!salt||await pwHash(password,salt)!==digest)return json({error:"Invalid email or password"},401,h);
  const token=hex(random(32).buffer),expires=new Date(Date.now()+604800000).toISOString();
  await env.DB.prepare("INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(),u.id,await hash(token),expires).run();
  return json({user:{id:u.id,email:u.email,full_name:u.full_name,role:u.role}},200,{...h,"set-cookie":cookie(token,604800)});
 }
 if(path==="/auth/me"&&req.method==="GET"){const u=await userFor(req,env);return u?json({user:u},200,h):json({error:"Sign in required"},401,h);}
 if(path==="/auth/logout"&&req.method==="POST"){const t=req.headers.get("Cookie")?.match(/(?:^|; )sterling_session=([^;]+)/)?.[1];if(t)await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await hash(t)).run();return json({ok:true},200,{...h,"set-cookie":cookie("",0)});}
 const u=await userFor(req,env);if(!u)return json({error:"Sign in required"},401,h);if(u.role==="student"&&path==="/api/courses"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT c.id,c.course_code,c.title,c.currency,c.fee_amount FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.student_id=? AND e.status='active' AND c.status='published'").bind(u.id).all();return json(rows.results||[],200,h);}if(u.role==="student"&&path==="/api/student/materials"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT m.id,m.title,m.file_type,m.file_size,m.created_at,c.title course_title FROM learning_materials m JOIN enrollments e ON e.course_id=m.course_id JOIN courses c ON c.id=m.course_id WHERE e.student_id=? AND e.status='active' ORDER BY m.created_at DESC").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="student"&&path.startsWith("/api/student/materials/")&&path.endsWith("/download")&&req.method==="GET"){const id=path.split("/")[4],row=await env.DB.prepare("SELECT m.file_key,m.file_type,m.title FROM learning_materials m JOIN enrollments e ON e.course_id=m.course_id WHERE m.id=? AND e.student_id=? AND e.status='active'").bind(id,u.id).first();if(!row)return json({error:"Material not found or you are not enrolled"},404,h);const obj=await env.FILES.get(row.file_key);if(!obj)return json({error:"File not found"},404,h);return new Response(obj.body,{status:200,headers:{...h,"content-type":row.file_type||"application/octet-stream","content-disposition":"inline; filename*=UTF-8''"+encodeURIComponent(row.title),"cache-control":"private, no-store","x-content-type-options":"nosniff"}});}
 if(u.role==="student"&&path==="/api/student/zoom-classes"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT z.id,z.title,z.meeting_url,z.starts_at,z.duration_minutes,c.title course_title FROM zoom_classes z JOIN enrollments e ON e.course_id=z.course_id JOIN courses c ON c.id=z.course_id WHERE e.student_id=? AND e.status='active' AND z.starts_at>=datetime('now','-1 day') ORDER BY z.starts_at ASC").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="student"&&path==="/api/student/announcements"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT id,title,body,audience,published_at FROM announcements WHERE audience IN ('all','students') AND published_at<=CURRENT_TIMESTAMP ORDER BY published_at DESC").all();return json(rows.results||[],200,h);}if(u.role==="student"&&path==="/api/student/payments"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT p.id,p.amount,p.currency,p.method,p.reference,p.status,p.created_at,p.reviewed_at,c.title course_title FROM payments p LEFT JOIN courses c ON c.id=p.course_id WHERE p.student_id=? ORDER BY p.created_at DESC").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="student"&&path==="/api/student/payments"&&req.method==="POST"){const form=await req.formData(),courseId=String(form.get("course_id")||""),amount=Number(form.get("amount")),method=String(form.get("method")||"bank_transfer"),reference=String(form.get("reference")||"").trim(),file=form.get("receipt");if(!courseId||!Number.isFinite(amount)||amount<=0||!["bank_transfer","cash","other"].includes(method)||!(file instanceof File)||!reference)return json({error:"Course, amount, method, reference and receipt are required"},400,h);if(file.size>10*1024*1024)return json({error:"Receipt must be 10 MB or smaller"},413,h);if(!["application/pdf","image/jpeg","image/png"].includes(file.type))return json({error:"Receipt must be PDF, JPG or PNG"},400,h);const enrolled=await env.DB.prepare("SELECT c.id,c.currency FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.student_id=? AND e.course_id=? AND e.status IN ('active','completed')").bind(u.id,courseId).first();if(!enrolled)return json({error:"You must be enrolled in this course"},403,h);const id=crypto.randomUUID(),key="payment-receipts/"+id+"/"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");await env.FILES.put(key,file.stream(),{httpMetadata:{contentType:file.type}});try{await env.DB.prepare("INSERT INTO payments(id,student_id,course_id,amount,currency,method,reference,receipt_key,status) VALUES(?,?,?,?,?,?,?,?, 'pending')").bind(id,u.id,courseId,amount,enrolled.currency||"LKR",method,reference,key).run();}catch(e){await env.FILES.delete(key);throw e;}return json({ok:true,id,status:"pending"},201,h);}
 if(!["admin","lecturer"].includes(u.role))return json({error:"Forbidden"},403,h);
 if(path==="/api/students"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const b=await getBody(req),studentNumber=String(b?.student_number||"").trim(),name=String(b?.full_name||"").trim(),email=String(b?.email||"").trim().toLowerCase(),phone=String(b?.phone||"").trim(),password=String(b?.password||"");
  if(!studentNumber||!name||!email||password.length<12)return json({error:"Student ID, full name, email and a password of at least 12 characters are required"},400,h);
  if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))return json({error:"Enter a valid email address"},400,h);
  const salt=hex(random(16).buffer),digest=await pwHash(password,salt);
  try{
   await env.DB.prepare("INSERT INTO users(id,student_number,full_name,email,phone,password_hash,role,status) VALUES(?,?,?,?,?,?,'student','active')").bind(crypto.randomUUID(),studentNumber,name,email,phone||null,salt+":"+digest).run();
   return json({ok:true,student:{student_number:studentNumber,full_name:name,email,status:"active"}},201,h);
  }catch(e){if(String(e?.message||e).toLowerCase().includes("unique"))return json({error:"That Student ID or email is already registered"},409,h);throw e;}
 }
 if(path==="/api/courses"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const b=await getBody(req),code=String(b?.course_code||"").trim().toUpperCase(),title=String(b?.title||"").trim(),description=String(b?.description||"").trim(),fee=Number(b?.fee_amount||0),currency=String(b?.currency||"LKR").trim().toUpperCase(),status=String(b?.status||"draft");
  if(!code||!title||!Number.isFinite(fee)||fee<0||!["draft","published"].includes(status))return json({error:"Course code, title, valid fee and status are required"},400,h);
  try{const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO courses(id,title,course_code,description,fee_amount,currency,status) VALUES(?,?,?,?,?,?,?)").bind(id,title,code,description||null,fee,currency,status).run();return json({ok:true,course:{id,course_code:code,title,fee_amount:fee,currency,status}},201,h);}catch(e){if(String(e?.message||e).toLowerCase().includes("unique"))return json({error:"That course code is already in use"},409,h);throw e;}
 }
 if(path==="/api/enrollments"&&req.method==="GET"){
  if(u.role!=="admin"&&u.role!=="lecturer")return json({error:"Access denied"},403,h);
  const rows=await env.DB.prepare("SELECT e.id,e.status,e.created_at,s.student_number,s.full_name AS student_name,c.course_code,c.title AS course_title FROM enrollments e JOIN users s ON s.id=e.student_id JOIN courses c ON c.id=e.course_id ORDER BY e.created_at DESC").all();
  return json(rows.results||[],200,h);
 }
 if(path==="/api/enrollments"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const b=await getBody(req),studentId=String(b?.student_id||""),courseId=String(b?.course_id||""),status=String(b?.status||"active");
  if(!studentId||!courseId||!["pending","active"].includes(status))return json({error:"Select a student and course"},400,h);
  const student=await env.DB.prepare("SELECT id FROM users WHERE id=? AND role='student' AND status='active'").bind(studentId).first();
  const course=await env.DB.prepare("SELECT id FROM courses WHERE id=? AND status='published'").bind(courseId).first();
  if(!student||!course)return json({error:"Choose an active student and a published course"},400,h);
  try{const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO enrollments(id,student_id,course_id,status) VALUES(?,?,?,?)").bind(id,studentId,courseId,status).run();return json({ok:true,id},201,h);}catch(e){if(String(e?.message||e).toLowerCase().includes("unique"))return json({error:"This student is already enrolled in that course"},409,h);throw e;}
 }
 if(path==="/api/materials"&&req.method==="GET"){
  if(u.role!=="admin"&&u.role!=="lecturer")return json({error:"Access denied"},403,h);
  const rows=await env.DB.prepare("SELECT m.id,m.title,m.file_key,m.file_type,m.file_size,m.created_at,c.course_code,c.title AS course_title FROM learning_materials m LEFT JOIN courses c ON c.id=m.course_id ORDER BY m.created_at DESC").all();
  return json(rows.results||[],200,h);
 }
 if(path==="/api/materials"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const form=await req.formData(),file=form.get("file"),courseId=String(form.get("course_id")||""),title=String(form.get("title")||"").trim();
  if(!(file instanceof File)||!title||!courseId)return json({error:"Title, course and file are required"},400,h);
  if(file.size>20*1024*1024)return json({error:"File must be 20 MB or smaller"},413,h);
  const allowed=["application/pdf","image/jpeg","image/png","video/mp4","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if(!allowed.includes(file.type))return json({error:"Allowed formats: PDF, JPG, PNG, MP4 and DOCX"},400,h);
  const course=await env.DB.prepare("SELECT id FROM courses WHERE id=?").bind(courseId).first();if(!course)return json({error:"Course not found"},404,h);
  const id=crypto.randomUUID(),key="materials/"+id+"/"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
  await env.FILES.put(key,file.stream(),{httpMetadata:{contentType:file.type}});
  try{await env.DB.prepare("INSERT INTO learning_materials(id,course_id,title,file_key,file_type,file_size,created_by) VALUES(?,?,?,?,?,?,?)").bind(id,courseId,title,key,file.type,file.size,u.id).run();}
  catch(e){await env.FILES.delete(key);throw e;}
  return json({ok:true,id,title,file_type:file.type,file_size:file.size},201,h);
 }
 if(path==="/api/zoom-classes"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const b=await getBody(req),courseId=String(b?.course_id||""),title=String(b?.title||"").trim(),meetingUrl=String(b?.meeting_url||"").trim(),startsAt=String(b?.starts_at||""),duration=Number(b?.duration_minutes||60);
  if(!courseId||!title||!meetingUrl||!startsAt||!Number.isInteger(duration)||duration<1||duration>720)return json({error:"Course, title, meeting URL, date/time and valid duration are required"},400,h);
  let url;try{url=new URL(meetingUrl)}catch{return json({error:"Enter a valid meeting URL"},400,h)}
  if(url.protocol!=="https:")return json({error:"Meeting URL must use HTTPS"},400,h);
  const course=await env.DB.prepare("SELECT id FROM courses WHERE id=?").bind(courseId).first();if(!course)return json({error:"Course not found"},404,h);
  const id=crypto.randomUUID();
  await env.DB.prepare("INSERT INTO zoom_classes(id,course_id,title,meeting_url,starts_at,duration_minutes,created_by) VALUES(?,?,?,?,?,?,?)").bind(id,courseId,title,meetingUrl,startsAt,duration,u.id).run();
  return json({ok:true,id},201,h);
 }
 if(path.startsWith("/api/payments/")&&path.endsWith("/review")&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const id=path.split("/")[3],b=await getBody(req),status=String(b?.status||"");
  if(!id||!["approved","rejected"].includes(status))return json({error:"Choose approved or rejected"},400,h);
  const payment=await env.DB.prepare("SELECT id,status FROM payments WHERE id=?").bind(id).first();
  if(!payment)return json({error:"Payment not found"},404,h);
  if(payment.status!=="pending")return json({error:"Only pending payments can be reviewed"},409,h);
  await env.DB.prepare("UPDATE payments SET status=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'").bind(status,u.id,id).run();
  return json({ok:true,id,status},200,h);
 }
 if(path==="/api/announcements"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const b=await getBody(req),title=String(b?.title||"").trim(),body=String(b?.body||"").trim(),audience=String(b?.audience||"all");
  if(!title||!body)return json({error:"Announcement title and message are required"},400,h);
  if(title.length>160||body.length>10000)return json({error:"Title must be 160 characters or less and message 10,000 characters or less"},400,h);
  if(!["all","students","lecturers"].includes(audience))return json({error:"Choose a valid audience"},400,h);
  const id=crypto.randomUUID();
  await env.DB.prepare("INSERT INTO announcements(id,title,body,audience,published_at,created_by) VALUES(?,?,?,?,CURRENT_TIMESTAMP,?)").bind(id,title,body,audience,u.id).run();
  return json({ok:true,id},201,h);
 }
 if(path==="/api/dashboard"){const q=await Promise.all(["SELECT COUNT(*) n FROM users WHERE role='student'","SELECT COUNT(*) n FROM courses WHERE status='published'","SELECT COUNT(*) n FROM payments WHERE status='pending'","SELECT COUNT(*) n FROM zoom_classes WHERE starts_at>=CURRENT_TIMESTAMP"].map(s=>env.DB.prepare(s).first()));return json({students:q[0].n,courses:q[1].n,pending_payments:q[2].n,upcoming_classes:q[3].n},200,h);}
 const sql={"/api/students":"SELECT id,student_number,full_name,email,phone,status,created_at FROM users WHERE role='student' ORDER BY created_at DESC","/api/courses":"SELECT * FROM courses ORDER BY created_at DESC","/api/zoom-classes":"SELECT z.*,c.title course_title FROM zoom_classes z LEFT JOIN courses c ON c.id=z.course_id ORDER BY z.starts_at DESC","/api/payments":"SELECT p.*,u.full_name student_name,c.title course_title FROM payments p LEFT JOIN users u ON u.id=p.student_id LEFT JOIN courses c ON c.id=p.course_id ORDER BY p.created_at DESC","/api/announcements":"SELECT * FROM announcements ORDER BY created_at DESC"};
 if(req.method==="GET"&&sql[path]){const result=await env.DB.prepare(sql[path]).all();return json(result.results,200,h);}
 return json({error:"Route not found"},404,h);
 }catch(e){console.error("Sterling LMS API error:",e);if(path==="/auth/bootstrap")return json({error:"Admin setup failed",detail:String(e?.message||e)},500,h);return json({error:"Internal server error"},500,h);}
}};
