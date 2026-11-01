const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
const hash=async s=>hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));
const random=n=>crypto.getRandomValues(new Uint8Array(n));
const pwHash=async(p,s)=>{const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(p),"PBKDF2",false,["deriveBits"]);const salt=Uint8Array.from(s.match(/.{2}/g).map(x=>parseInt(x,16)));return hex(await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:100000,hash:"SHA-256"},k,256));};
const cookie=(t,a,role="student")=>`${role==="admin"?"sterling_admin_session":"sterling_student_session"}=${t}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${a}`;
const getBody=async r=>{try{return await r.json()}catch{return null}};
async function userFor(r,env,roleHint){const path=new URL(r.url).pathname;const role=roleHint||(path.startsWith("/api/student/")?"student":"admin");const jar=r.headers.get("Cookie")||"";const name=role==="admin"?"sterling_admin_session":"sterling_student_session";let t=jar.match(new RegExp("(?:^|; )"+name+"=([^;]+)"))?.[1];if(!t){const legacy=jar.match(/(?:^|; )sterling_session=([^;]+)/)?.[1];if(legacy){const old=await env.DB.prepare("SELECT u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>CURRENT_TIMESTAMP AND u.status='active'").bind(await hash(legacy)).first();if(old?.role===role)t=legacy;}}if(!t)return null;return await env.DB.prepare("SELECT u.id,u.email,u.full_name,u.role,u.status FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>CURRENT_TIMESTAMP AND u.status='active' AND u.role=?").bind(await hash(t),role).first();}
export default {async fetch(req,env){
 const origin=req.headers.get("Origin")||"",ownOrigin=new URL(req.url).origin,allowed=[...(env.ALLOWED_ORIGIN||"https://bookfairdigital.github.io").split(",").map(x=>x.trim()),ownOrigin];
 const h={"access-control-allow-origin":allowed.includes(origin)?origin:allowed[0],"access-control-allow-credentials":"true","access-control-allow-methods":"GET,POST,PATCH,DELETE,OPTIONS","access-control-allow-headers":"Content-Type","vary":"Origin"};
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
  return json({user:{id:u.id,email:u.email,full_name:u.full_name,role:u.role}},200,{...h,"set-cookie":cookie(token,604800,u.role)});
 }
 if(path==="/auth/me"&&req.method==="GET"){const role=new URL(req.url).searchParams.get("role")==="admin"?"admin":"student";const u=await userFor(req,env,role);return u?json({user:u},200,h):json({error:"Sign in required"},401,h);}
 if(path==="/auth/logout"&&req.method==="POST"){const role=new URL(req.url).searchParams.get("role")==="admin"?"admin":"student";const name=role==="admin"?"sterling_admin_session":"sterling_student_session";const t=req.headers.get("Cookie")?.match(new RegExp("(?:^|; )"+name+"=([^;]+)"))?.[1];if(t)await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await hash(t)).run();return json({ok:true},200,{...h,"set-cookie":cookie("",0,role)});}

 if(path==="/public/courses"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT id,course_code,title,description,fee_amount,currency,course_type,qualification,duration_months,institutional_months,on_job_months,training_locations,course_plan FROM courses WHERE status='published' ORDER BY course_type,title").all();return json(rows.results||[],200,h);}
 if(path==="/public/gallery"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT id,title,description,category,file_type,created_at FROM gallery_items WHERE category!='passout' ORDER BY created_at DESC LIMIT 60").all();return json(rows.results||[],200,h);}
 if(path==="/public/settings"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT key,value FROM site_settings WHERE key IN ('payment_qr_url','bank_details','whatsapp_number','contact_phone','contact_email','centre_accreditation')").all();return json(Object.fromEntries((rows.results||[]).map(x=>[x.key,x.value])),200,h);}
 if(path==="/api/enrollment-applications"&&req.method==="POST"){const b=await getBody(req),name=String(b?.full_name||"").trim(),email=String(b?.email||"").trim().toLowerCase(),phone=String(b?.phone||"").trim(),course=String(b?.course_id||"");if(name.length<3||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||phone.length<7||!course)return json({error:"Enter your name, valid email, phone number and choose a course"},400,h);const valid=await env.DB.prepare("SELECT id FROM courses WHERE id=? AND status='published'").bind(course).first();if(!valid)return json({error:"Selected course is not available"},404,h);const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO enrollment_applications(id,full_name,email,phone,nic,address,course_id,qualifications,message) VALUES(?,?,?,?,?,?,?,?,?)").bind(id,name,email,phone,String(b?.nic||"").trim()||null,String(b?.address||"").trim()||null,course,String(b?.qualifications||"").trim()||null,String(b?.message||"").trim()||null).run();return json({ok:true,application_id:id,message:"Your application has been received. Sterling Training Centre will contact you."},201,h);}
 if(path==="/api/chat"&&req.method==="POST"){const b=await getBody(req),name=String(b?.name||"").trim(),email=String(b?.email||"").trim(),message=String(b?.message||"").trim();if(name.length<2||message.length<2||message.length>3000)return json({error:"Enter your name and a message (up to 3000 characters)"},400,h);const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO chat_messages(id,sender_name,sender_email,sender_role,message) VALUES(?,?,?,'visitor',?)").bind(id,name,email||null,message).run();return json({ok:true,message:"Message sent to Sterling Training Centre."},201,h);}
 if(path.startsWith("/public/gallery/")&&req.method==="GET"){const id=path.split("/")[3],row=await env.DB.prepare("SELECT file_key,file_type FROM gallery_items WHERE id=?").bind(id).first();if(!row)return json({error:"Image not found"},404,h);const obj=await env.FILES.get(row.file_key);if(!obj)return json({error:"Image missing"},404,h);return new Response(obj.body,{status:200,headers:{...h,"content-type":row.file_type||"application/octet-stream","cache-control":"public, max-age=3600"}});}
 const u=await userFor(req,env,path.startsWith("/api/student/")?"student":"admin");if(!u)return json({error:"Sign in required"},401,h);if(u.role==="student"&&path==="/api/student/dashboard"&&req.method==="GET"){const [courses,payments,attendance,classes]=await Promise.all([env.DB.prepare("SELECT COUNT(*) count FROM enrollments WHERE student_id=? AND status='active'").bind(u.id).first(),env.DB.prepare("SELECT COALESCE(SUM(CASE WHEN status='approved' THEN amount ELSE 0 END),0) paid,COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END),0) pending FROM payments WHERE student_id=?").bind(u.id).first(),env.DB.prepare("SELECT COUNT(*) total,SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) present FROM attendance WHERE student_id=?").bind(u.id).first(),env.DB.prepare("SELECT z.id,z.title,z.starts_at,z.duration_minutes,c.title course_title FROM zoom_classes z JOIN enrollments e ON e.course_id=z.course_id JOIN courses c ON c.id=z.course_id WHERE e.student_id=? AND e.status='active' AND z.starts_at>=datetime('now') ORDER BY z.starts_at LIMIT 3").bind(u.id).all()]);return json({courses:courses?.count||0,paid:payments?.paid||0,pending:payments?.pending||0,attendance_total:attendance?.total||0,attendance_present:attendance?.present||0,upcoming_classes:classes.results||[]},200,h);}
 if(u.role==="student"&&path==="/api/courses"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT c.id,c.course_code,c.title,c.description,c.currency,c.fee_amount,c.lecturer_id FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.student_id=? AND e.status='active' AND c.status='published'").bind(u.id).all();return json(rows.results||[],200,h);}if(u.role==="student"&&path==="/api/student/materials"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT m.id,m.course_id,m.title,m.file_type,m.file_size,m.created_at,c.title course_title FROM learning_materials m JOIN enrollments e ON e.course_id=m.course_id JOIN courses c ON c.id=m.course_id WHERE e.student_id=? AND e.status='active' ORDER BY m.created_at DESC").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="student"&&path.startsWith("/api/student/materials/")&&path.endsWith("/download")&&req.method==="GET"){const id=path.split("/")[4],row=await env.DB.prepare("SELECT m.file_key,m.file_type,m.title FROM learning_materials m JOIN enrollments e ON e.course_id=m.course_id WHERE m.id=? AND e.student_id=? AND e.status='active'").bind(id,u.id).first();if(!row)return json({error:"Material not found or you are not enrolled"},404,h);const obj=await env.FILES.get(row.file_key);if(!obj)return json({error:"File not found"},404,h);return new Response(obj.body,{status:200,headers:{...h,"content-type":row.file_type||"application/octet-stream","content-disposition":"inline; filename*=UTF-8''"+encodeURIComponent(row.title),"cache-control":"private, no-store","x-content-type-options":"nosniff"}});}
 if(u.role==="student"&&path==="/api/student/zoom-classes"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT z.id,z.title,z.meeting_url,z.starts_at,z.duration_minutes,c.title course_title FROM zoom_classes z JOIN enrollments e ON e.course_id=z.course_id JOIN courses c ON c.id=z.course_id WHERE e.student_id=? AND e.status='active' AND z.starts_at>=datetime('now','-1 day') ORDER BY z.starts_at ASC").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="student"&&path==="/api/student/announcements"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT id,title,body,audience,published_at FROM announcements WHERE audience IN ('all','students') AND published_at<=CURRENT_TIMESTAMP ORDER BY published_at DESC").all();return json(rows.results||[],200,h);}if(u.role==="student"&&path==="/api/student/payments"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT p.id,p.amount,p.currency,p.method,p.reference,p.status,p.created_at,p.reviewed_at,c.title course_title FROM payments p LEFT JOIN courses c ON c.id=p.course_id WHERE p.student_id=? ORDER BY p.created_at DESC").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="student"&&path==="/api/student/payments"&&req.method==="POST"){const form=await req.formData(),courseId=String(form.get("course_id")||""),amount=Number(form.get("amount")),method=String(form.get("method")||"bank_transfer"),reference=String(form.get("reference")||"").trim(),file=form.get("receipt");if(!courseId||!Number.isFinite(amount)||amount<=0||!["bank_transfer","cash","other"].includes(method)||!(file instanceof File)||!reference)return json({error:"Course, amount, method, reference and receipt are required"},400,h);if(file.size>10*1024*1024)return json({error:"Receipt must be 10 MB or smaller"},413,h);if(!["application/pdf","image/jpeg","image/png"].includes(file.type))return json({error:"Receipt must be PDF, JPG or PNG"},400,h);const enrolled=await env.DB.prepare("SELECT c.id,c.currency FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.student_id=? AND e.course_id=? AND e.status IN ('active','completed')").bind(u.id,courseId).first();if(!enrolled)return json({error:"You must be enrolled in this course"},403,h);const id=crypto.randomUUID(),key="payment-receipts/"+id+"/"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");await env.FILES.put(key,file.stream(),{httpMetadata:{contentType:file.type}});try{await env.DB.prepare("INSERT INTO payments(id,student_id,course_id,amount,currency,method,reference,receipt_key,status) VALUES(?,?,?,?,?,?,?,?, 'pending')").bind(id,u.id,courseId,amount,enrolled.currency||"LKR",method,reference,key).run();}catch(e){await env.FILES.delete(key);throw e;}return json({ok:true,id,status:"pending"},201,h);}
 if(!["admin","lecturer"].includes(u.role)&&!(u.role==="student"&&(path==="/api/student/assignments"||path.startsWith("/api/student/assignments/")||path==="/api/student/assessments"||path==="/api/student/assessment-results"||path==="/api/student/profile"||path==="/api/student/attendance"||path==="/api/student/lecturers"||path==="/api/student/course-plans"||path==="/api/student/continuous-assessments"||/^\/api\/assessments\/[^/]+\/questions$/.test(path))))return json({error:"Forbidden"},403,h);

 if(path==="/api/student/profile"&&req.method==="GET"){if(u.role!=="student")return json({error:"Student access required"},403,h);const user=await env.DB.prepare("SELECT id,full_name,email,phone FROM users WHERE id=? AND role='student'").bind(u.id).first();return json({user},200,h);}
 if(path==="/api/student/profile"&&req.method==="PATCH"){if(u.role!=="student")return json({error:"Student access required"},403,h);const b=await getBody(req),name=String(b?.full_name||"").trim(),email=String(b?.email||"").trim().toLowerCase(),phone=String(b?.phone||"").trim();if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Enter a valid name and email"},400,h);try{await env.DB.prepare("UPDATE users SET full_name=?,email=?,phone=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND role='student'").bind(name,email,phone||null,u.id).run();return json({ok:true},200,h);}catch(e){if(String(e?.message||e).toLowerCase().includes("unique"))return json({error:"That email is already in use"},409,h);throw e;}}
 if(u.role==="student"&&path==="/api/student/attendance"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT a.id,a.class_date attendance_date,a.status,a.created_at,c.title course_title FROM attendance a JOIN courses c ON c.id=a.course_id WHERE a.student_id=? ORDER BY a.class_date DESC").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="student"&&path==="/api/student/lecturers"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT DISTINCT l.id,l.full_name,l.email,c.title course_title FROM courses c JOIN users l ON l.id=c.lecturer_id JOIN enrollments e ON e.course_id=c.id WHERE e.student_id=? AND e.status='active' AND c.status='published' AND l.role='lecturer'").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="admin"&&path==="/api/lecturers"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT id,full_name,email,phone,status FROM users WHERE role='lecturer' ORDER BY full_name").all();return json(rows.results||[],200,h);}
 if(u.role==="admin"&&path==="/api/lecturers"&&req.method==="POST"){const b=await getBody(req),name=String(b?.full_name||"").trim(),email=String(b?.email||"").trim().toLowerCase(),phone=String(b?.phone||"").trim(),password=String(b?.password||"");if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12)return json({error:"Name, valid email and password (12+ characters) are required"},400,h);const salt=hex(random(16).buffer),digest=await pwHash(password,salt);try{const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO users(id,full_name,email,phone,password_hash,role,status) VALUES(?,?,?,?,?,'lecturer','active')").bind(id,name,email,phone||null,salt+":"+digest).run();return json({ok:true,id,full_name:name,email},201,h);}catch(e){if(String(e?.message||e).toLowerCase().includes("unique"))return json({error:"That email is already registered"},409,h);throw e;}}
 if(path==="/api/attendance"&&req.method==="GET"){if(u.role!=="admin"&&u.role!=="lecturer")return json({error:"Access denied"},403,h);const rows=await env.DB.prepare("SELECT a.id,a.student_id,a.course_id,a.class_date,a.status,s.full_name student_name,s.student_number,c.title course_title FROM attendance a JOIN users s ON s.id=a.student_id JOIN courses c ON c.id=a.course_id ORDER BY a.class_date DESC LIMIT 500").all();return json(rows.results||[],200,h);}
 if(path==="/api/attendance"&&req.method==="POST"){if(u.role!=="admin"&&u.role!=="lecturer")return json({error:"Access denied"},403,h);const b=await getBody(req),course=String(b?.course_id||""),student=String(b?.student_id||""),date=String(b?.class_date||""),status=String(b?.status||"");if(!course||!student||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!["present","absent","late","excused"].includes(status))return json({error:"Choose course, student, date and valid attendance status"},400,h);const enrolled=await env.DB.prepare("SELECT id FROM enrollments WHERE course_id=? AND student_id=? AND status='active'").bind(course,student).first();if(!enrolled)return json({error:"Student is not actively enrolled in this course"},400,h);await env.DB.prepare("INSERT INTO attendance(id,student_id,course_id,class_date,status,marked_by) VALUES(?,?,?,?,?,?) ON CONFLICT(student_id,course_id,class_date) DO UPDATE SET status=excluded.status,marked_by=excluded.marked_by").bind(crypto.randomUUID(),student,course,date,status,u.id).run();return json({ok:true},200,h);}

 if(u.role==="lecturer"&&path==="/api/attendance"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT a.id,a.student_id,a.course_id,a.class_date,a.status,s.full_name student_name,s.student_number,c.title course_title FROM attendance a JOIN users s ON s.id=a.student_id JOIN courses c ON c.id=a.course_id WHERE c.lecturer_id=? ORDER BY a.class_date DESC LIMIT 500").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="student"&&path==="/api/student/course-plans"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT p.id,p.title,p.description,p.plan_order,p.start_month,p.end_month,c.title course_title,c.course_code FROM course_plans p JOIN courses c ON c.id=p.course_id JOIN enrollments e ON e.course_id=c.id WHERE e.student_id=? AND e.status='active' ORDER BY c.title,p.plan_order").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="student"&&path==="/api/student/continuous-assessments"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT a.id,a.title,a.assessment_type,a.score,a.max_score,a.feedback,a.assessed_at,c.title course_title FROM continuous_assessments a JOIN courses c ON c.id=a.course_id WHERE a.student_id=? ORDER BY a.assessed_at DESC").bind(u.id).all();return json(rows.results||[],200,h);}
 if(u.role==="admin"&&path==="/api/course-plans"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT p.*,c.title course_title,c.course_code FROM course_plans p JOIN courses c ON c.id=p.course_id ORDER BY c.title,p.plan_order").all();return json(rows.results||[],200,h);}
 if(u.role==="admin"&&path==="/api/course-plans"&&req.method==="POST"){const b=await getBody(req),course=String(b?.course_id||""),title=String(b?.title||"").trim(),description=String(b?.description||"").trim(),order=Number(b?.plan_order||0),start=Number(b?.start_month||0),end=Number(b?.end_month||0);if(!course||!title||!Number.isInteger(order)||!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<0||end>120||start>end)return json({error:"Enter valid course plan details"},400,h);const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO course_plans(id,course_id,title,description,plan_order,start_month,end_month,created_by) VALUES(?,?,?,?,?,?,?,?)").bind(id,course,title,description||null,order,start||null,end||null,u.id).run();return json({ok:true,id},201,h);}
 if(u.role==="admin"&&path==="/api/continuous-assessments"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT a.*,s.full_name student_name,s.student_number,c.title course_title FROM continuous_assessments a JOIN users s ON s.id=a.student_id JOIN courses c ON c.id=a.course_id ORDER BY a.assessed_at DESC").all();return json(rows.results||[],200,h);}
 if(u.role==="admin"&&path==="/api/continuous-assessments"&&req.method==="POST"){const b=await getBody(req),course=String(b?.course_id||""),student=String(b?.student_id||""),title=String(b?.title||"").trim(),type=String(b?.assessment_type||"practical"),score=Number(b?.score),max=Number(b?.max_score),feedback=String(b?.feedback||"").trim();if(!course||!student||!title||!["practical","theory","assignment","observation","project"].includes(type)||!Number.isFinite(score)||!Number.isFinite(max)||max<=0||score<0||score>max)return json({error:"Enter valid assessment record details"},400,h);const enrolled=await env.DB.prepare("SELECT id FROM enrollments WHERE course_id=? AND student_id=? AND status='active'").bind(course,student).first();if(!enrolled)return json({error:"Student is not actively enrolled in this course"},400,h);const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO continuous_assessments(id,course_id,student_id,title,assessment_type,score,max_score,feedback,assessed_by) VALUES(?,?,?,?,?,?,?,?,?)").bind(id,course,student,title,type,score,max,feedback||null,u.id).run();return json({ok:true,id},201,h);}
 if(u.role==="admin"&&path==="/api/enrollment-applications"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT a.*,c.title course_title,c.course_code FROM enrollment_applications a JOIN courses c ON c.id=a.course_id ORDER BY a.created_at DESC").all();return json(rows.results||[],200,h);}
 if(u.role==="admin"&&path.match(/^\/api\/enrollment-applications\/[^/]+\/review$/)&&req.method==="POST"){const id=path.split("/")[3],b=await getBody(req),decision=String(b?.status||"");const a=await env.DB.prepare("SELECT * FROM enrollment_applications WHERE id=?").bind(id).first();if(!a)return json({error:"Application not found"},404,h);if(a.status!=="pending")return json({error:"Application already reviewed"},409,h);if(decision==="rejected"){await env.DB.prepare("UPDATE enrollment_applications SET status='rejected',reviewed_by=? WHERE id=?").bind(u.id,id).run();return json({ok:true,status:"rejected"},200,h);}if(decision!=="approved")return json({error:"Choose approved or rejected"},400,h);const existing=await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(a.email).first();if(existing)return json({error:"A user already exists with this email. Resolve the existing account before approving."},409,h);const studentId=crypto.randomUUID(),studentNumber="ST"+Date.now().toString().slice(-8),tempPassword=Array.from(random(9),x=>"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"[x%56]).join(""),salt=hex(random(16).buffer),digest=await pwHash(tempPassword,salt);await env.DB.batch([env.DB.prepare("INSERT INTO users(id,student_number,full_name,email,phone,password_hash,role,status) VALUES(?,?,?,?,?,?,'student','active')").bind(studentId,studentNumber,a.full_name,a.email,a.phone,salt+":"+digest),env.DB.prepare("INSERT INTO enrollments(id,student_id,course_id,status) VALUES(?,?,?,'active')").bind(crypto.randomUUID(),studentId,a.course_id),env.DB.prepare("UPDATE enrollment_applications SET status='approved',reviewed_by=?,student_id=? WHERE id=?").bind(u.id,studentId,id)]);return json({ok:true,status:"approved",student:{id:studentId,student_number:studentNumber,full_name:a.full_name,email:a.email,temporary_password:tempPassword}},200,h);}
 if(u.role==="admin"&&path==="/api/chat"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 200").all();return json(rows.results||[],200,h);}
 if(u.role==="admin"&&path==="/api/chat/reply"&&req.method==="POST"){const b=await getBody(req),id=String(b?.id||"");if(!id)return json({error:"Message ID required"},400,h);await env.DB.prepare("UPDATE chat_messages SET status='replied' WHERE id=?").bind(id).run();return json({ok:true},200,h);}
 if(u.role==="admin"&&path==="/api/site-settings"&&req.method==="PATCH"){const b=await getBody(req);const allowed=["payment_qr_url","bank_details","whatsapp_number","contact_phone","contact_email","centre_accreditation"];const stmts=allowed.filter(k=>typeof b?.[k]==="string").map(k=>env.DB.prepare("INSERT INTO site_settings(key,value,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").bind(k,String(b[k]).trim()));if(stmts.length)await env.DB.batch(stmts);return json({ok:true},200,h);}
 if(u.role==="admin"&&path==="/api/gallery"&&req.method==="GET"){const rows=await env.DB.prepare("SELECT id,title,description,category,file_type,created_at FROM gallery_items ORDER BY created_at DESC").all();return json(rows.results||[],200,h);}
 if(u.role==="admin"&&path==="/api/gallery"&&req.method==="POST"){const form=await req.formData(),title=String(form.get("title")||"").trim(),description=String(form.get("description")||"").trim(),category=String(form.get("category")||"csr"),file=form.get("file");if(!title||!(file instanceof File)||!["certificate","csr","personality","passout"].includes(category)||file.size>12*1024*1024||!["image/jpeg","image/png","image/webp"].includes(file.type))return json({error:"Upload a JPG, PNG or WebP image under 12 MB and enter a title/category"},400,h);const id=crypto.randomUUID(),key="gallery/"+id;await env.FILES.put(key,file.stream(),{httpMetadata:{contentType:file.type}});await env.DB.prepare("INSERT INTO gallery_items(id,title,description,category,file_key,file_type,created_by) VALUES(?,?,?,?,?,?,?)").bind(id,title,description||null,category,key,file.type,u.id).run();return json({ok:true,id},201,h);}
 if(u.role==="admin"&&path==="/api/gallery"&&req.method==="DELETE"){const b=await getBody(req),id=String(b?.id||"");const item=await env.DB.prepare("SELECT file_key FROM gallery_items WHERE id=?").bind(id).first();if(!item)return json({error:"Gallery item not found"},404,h);await env.FILES.delete(item.file_key);await env.DB.prepare("DELETE FROM gallery_items WHERE id=?").bind(id).run();return json({ok:true},200,h);}

 if(path==="/api/students"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const b=await getBody(req),studentNumber=String(b?.student_number||"").trim(),name=String(b?.full_name||"").trim(),email=String(b?.email||"").trim().toLowerCase(),phone=String(b?.phone||"").trim(),password=String(b?.password||"");
  if(!studentNumber||!name||!email||password.length<12)return json({error:"Student ID, full name, email and a password of at least 12 characters are required"},400,h);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Enter a valid email address"},400,h);
  const salt=hex(random(16).buffer),digest=await pwHash(password,salt);
  try{
   await env.DB.prepare("INSERT INTO users(id,student_number,full_name,email,phone,password_hash,role,status) VALUES(?,?,?,?,?,?,'student','active')").bind(crypto.randomUUID(),studentNumber,name,email,phone||null,salt+":"+digest).run();
   return json({ok:true,student:{student_number:studentNumber,full_name:name,email,status:"active"}},201,h);
  }catch(e){if(String(e?.message||e).toLowerCase().includes("unique"))return json({error:"That Student ID or email is already registered"},409,h);throw e;}
 }
 if(path==="/api/courses"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const b=await getBody(req),code=String(b?.course_code||"").trim().toUpperCase(),title=String(b?.title||"").trim(),description=String(b?.description||"").trim(),fee=Number(b?.fee_amount||0),currency=String(b?.currency||"LKR").trim().toUpperCase(),status=String(b?.status||"draft"),lecturerId=String(b?.lecturer_id||"")||null,courseType=String(b?.course_type||"full_time"),qualification=String(b?.qualification||"").trim(),duration=Number(b?.duration_months||24),institutional=Number(b?.institutional_months||12),onJob=Number(b?.on_job_months||12),locations=String(b?.training_locations||"").trim(),plan=String(b?.course_plan||"").trim();
  if(!code||!title||!Number.isFinite(fee)||fee<0||!["draft","published"].includes(status)||!["full_time","part_time"].includes(courseType)||![duration,institutional,onJob].every(x=>Number.isInteger(x)&&x>=0&&x<=120)||duration<1)return json({error:"Enter valid course details, type and duration"},400,h);
  if(status==="published"&&!lecturerId)return json({error:"Assign a lecturer before publishing this course"},400,h);
  if(lecturerId){const lecturer=await env.DB.prepare("SELECT id FROM users WHERE id=? AND role='lecturer' AND status='active'").bind(lecturerId).first();if(!lecturer)return json({error:"Choose an active lecturer account"},400,h);}
  try{const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO courses(id,title,course_code,description,fee_amount,currency,status,lecturer_id,course_type,qualification,duration_months,institutional_months,on_job_months,training_locations,course_plan) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,title,code,description||null,fee,currency,status,lecturerId,courseType,qualification||null,duration,institutional,onJob,locations||null,plan||null).run();return json({ok:true,course:{id,course_code:code,title,fee_amount:fee,currency,status,lecturer_id:lecturerId,course_type:courseType}},201,h);}catch(e){if(String(e?.message||e).toLowerCase().includes("unique"))return json({error:"That course code is already in use"},409,h);throw e;}
 }
 if(path==="/api/enrollments"&&req.method==="GET"){
  if(u.role!=="admin"&&u.role!=="lecturer")return json({error:"Access denied"},403,h);
  const rows=await env.DB.prepare("SELECT e.id,e.status,e.enrolled_at AS created_at,s.student_number,s.full_name AS student_name,c.course_code,c.title AS course_title FROM enrollments e JOIN users s ON s.id=e.student_id JOIN courses c ON c.id=e.course_id ORDER BY e.enrolled_at DESC").all();
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

 if(u.role==="student"&&path==="/api/student/assignments"&&req.method==="GET"){
  const rows=await env.DB.prepare("SELECT a.id,a.title,a.description,a.due_at,a.created_at,c.title course_title,c.course_code,s.id submission_id,s.submitted_at,s.grade,s.feedback,CASE WHEN s.id IS NOT NULL THEN 'submitted' WHEN a.due_at IS NOT NULL AND datetime(a.due_at)<datetime('now') THEN 'overdue' ELSE 'pending' END status FROM assignments a JOIN enrollments e ON e.course_id=a.course_id AND e.student_id=? AND e.status='active' JOIN courses c ON c.id=a.course_id LEFT JOIN submissions s ON s.assignment_id=a.id AND s.student_id=? ORDER BY CASE WHEN a.due_at IS NULL THEN 1 ELSE 0 END,a.due_at ASC").bind(u.id,u.id).all();
  return json(rows.results||[],200,h);
 }
 if(u.role==="student"&&path.startsWith("/api/student/assignments/")&&path.endsWith("/submit")&&req.method==="POST"){
  const id=path.split("/")[4],form=await req.formData(),file=form.get("file");
  if(!(file instanceof File))return json({error:"Choose a file to submit"},400,h);
  if(file.size>10*1024*1024)return json({error:"Submission must be 10 MB or smaller"},413,h);
  const allowed=["application/pdf","image/jpeg","image/png","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if(!allowed.includes(file.type))return json({error:"Allowed formats: PDF, JPG, PNG and DOCX"},400,h);
  const assignment=await env.DB.prepare("SELECT a.id,a.due_at FROM assignments a JOIN enrollments e ON e.course_id=a.course_id WHERE a.id=? AND e.student_id=? AND e.status='active'").bind(id,u.id).first();
  if(!assignment)return json({error:"Assignment not found or you are not enrolled"},404,h);
  if(assignment.due_at&&new Date(assignment.due_at).getTime()<Date.now())return json({error:"The submission deadline has passed"},409,h);
  const existing=await env.DB.prepare("SELECT id,file_key FROM submissions WHERE assignment_id=? AND student_id=?").bind(id,u.id).first();
  const submissionId=existing?.id||crypto.randomUUID(),key="assignment-submissions/"+submissionId+"/"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
  await env.FILES.put(key,file.stream(),{httpMetadata:{contentType:file.type}});
  try{
   if(existing)await env.DB.prepare("UPDATE submissions SET file_key=?,submitted_at=CURRENT_TIMESTAMP WHERE id=?").bind(key,submissionId).run();
   else await env.DB.prepare("INSERT INTO submissions(id,assignment_id,student_id,file_key) VALUES(?,?,?,?)").bind(submissionId,id,u.id,key).run();
  }catch(e){await env.FILES.delete(key);throw e;}
  if(existing?.file_key&&existing.file_key!==key)await env.FILES.delete(existing.file_key);
  return json({ok:true,id:submissionId,status:"submitted"},201,h);
 }
 if(path==="/api/assignments"&&req.method==="GET"){
  if(!["admin","lecturer"].includes(u.role))return json({error:"Access denied"},403,h);
  const rows=await env.DB.prepare("SELECT a.id,a.title,a.description,a.due_at,a.created_at,c.course_code,c.title course_title,(SELECT COUNT(*) FROM submissions s WHERE s.assignment_id=a.id) submission_count FROM assignments a LEFT JOIN courses c ON c.id=a.course_id ORDER BY a.created_at DESC").all();
  return json(rows.results||[],200,h);
 }
 if(path==="/api/assignments"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const b=await getBody(req),courseId=String(b?.course_id||""),title=String(b?.title||"").trim(),description=String(b?.description||"").trim(),dueAt=String(b?.due_at||"").trim();
  if(!courseId||!title)return json({error:"Course and assignment title are required"},400,h);
  if(title.length>180||description.length>5000)return json({error:"Title must be 180 characters or less and description 5,000 characters or less"},400,h);
  const course=await env.DB.prepare("SELECT id FROM courses WHERE id=? AND status='published'").bind(courseId).first();
  if(!course)return json({error:"Choose a published course"},400,h);
  const id=crypto.randomUUID();
  await env.DB.prepare("INSERT INTO assignments(id,course_id,title,description,due_at,created_by) VALUES(?,?,?,?,?,?)").bind(id,courseId,title,description||null,dueAt||null,u.id).run();
  return json({ok:true,id},201,h);
 }
 if(path.startsWith("/api/assignments/")&&path.endsWith("/submissions")&&req.method==="GET"){
  if(!["admin","lecturer"].includes(u.role))return json({error:"Access denied"},403,h);
  const id=path.split("/")[3],rows=await env.DB.prepare("SELECT s.id,s.student_id,s.submitted_at,s.grade,s.feedback,s.file_key,u.student_number,u.full_name student_name,u.email FROM submissions s JOIN users u ON u.id=s.student_id WHERE s.assignment_id=? ORDER BY s.submitted_at DESC").bind(id).all();
  return json(rows.results||[],200,h);
 }
 if(path.startsWith("/api/assignments/")&&path.endsWith("/grade")&&req.method==="POST"){
  if(!["admin","lecturer"].includes(u.role))return json({error:"Access denied"},403,h);
  const id=path.split("/")[3],b=await getBody(req),submissionId=String(b?.submission_id||""),grade=Number(b?.grade),feedback=String(b?.feedback||"").trim();
  if(!submissionId||!Number.isFinite(grade)||grade<0||grade>100)return json({error:"Submission and a grade from 0 to 100 are required"},400,h);
  const result=await env.DB.prepare("UPDATE submissions SET grade=?,feedback=? WHERE id=? AND assignment_id=?").bind(grade,feedback||null,submissionId,id).run();
  if(!result.meta?.changes)return json({error:"Submission not found"},404,h);
  return json({ok:true},200,h);
 }
 if(path.startsWith("/api/assignments/")&&path.endsWith("/download")&&req.method==="GET"){
  if(!["admin","lecturer"].includes(u.role))return json({error:"Access denied"},403,h);
  const id=path.split("/")[3],row=await env.DB.prepare("SELECT file_key FROM submissions WHERE id=?").bind(id).first();
  if(!row)return json({error:"Submission not found"},404,h);
  const obj=await env.FILES.get(row.file_key);if(!obj)return json({error:"File not found"},404,h);
  return new Response(obj.body,{status:200,headers:{...h,"content-type":obj.httpMetadata?.contentType||"application/octet-stream","content-disposition":"attachment","cache-control":"private, no-store"}});
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
 if(path==="/api/reports"&&req.method==="GET"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const [students,courses,enrolments,payments,attendance,assignments,monthly,courseStats,recent] = await Promise.all([
   env.DB.prepare("SELECT COUNT(*) total,SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) active FROM users WHERE role='student'").first(),
   env.DB.prepare("SELECT COUNT(*) total,SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) published FROM courses").first(),
   env.DB.prepare("SELECT COUNT(*) total,SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) active FROM enrollments").first(),
   env.DB.prepare("SELECT COUNT(*) total,COALESCE(SUM(CASE WHEN status='approved' THEN amount ELSE 0 END),0) approved_amount,COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END),0) pending_amount,SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) pending_count FROM payments").first(),
   env.DB.prepare("SELECT COUNT(*) total,SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) present FROM attendance").first(),
   env.DB.prepare("SELECT COUNT(*) total,(SELECT COUNT(*) FROM submissions) submissions FROM assignments").first(),
   env.DB.prepare("SELECT strftime('%Y-%m',created_at) month,COUNT(*) count,COALESCE(SUM(CASE WHEN status='approved' THEN amount ELSE 0 END),0) revenue FROM payments WHERE created_at>=date('now','-11 months') GROUP BY strftime('%Y-%m',created_at) ORDER BY month").all(),
   env.DB.prepare("SELECT c.id,c.course_code,c.title,COUNT(e.id) enrolments FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id GROUP BY c.id ORDER BY enrolments DESC LIMIT 8").all(),
   env.DB.prepare("SELECT 'Student' type,full_name label,created_at FROM users WHERE role='student' UNION ALL SELECT 'Payment',reference,created_at FROM payments UNION ALL SELECT 'Course',title,created_at FROM courses ORDER BY created_at DESC LIMIT 8").all()
  ]);
  return json({students,courses,enrolments,payments,attendance,assignments,monthly:monthly.results||[],course_stats:courseStats.results||[],recent:recent.results||[]},200,h);
 }

 if(path.startsWith("/api/students/")&&path.endsWith("/reset-password")&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const id=path.split("/")[3],b=await getBody(req),password=String(b?.password||"");
  if(password.length<12)return json({error:"Password must be at least 12 characters"},400,h);
  const student=await env.DB.prepare("SELECT id FROM users WHERE id=? AND role='student'").bind(id).first();if(!student)return json({error:"Student not found"},404,h);
  const salt=hex(random(16).buffer),digest=await pwHash(password,salt);
  await env.DB.prepare("UPDATE users SET password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(salt+":"+digest,id).run();
  await env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(id).run();return json({ok:true},200,h);
 }
 if(path==="/api/enrollments/bulk"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const b=await getBody(req),courseId=String(b?.course_id||""),ids=Array.isArray(b?.student_ids)?[...new Set(b.student_ids.map(String))]:[];
  if(!courseId||!ids.length||ids.length>200)return json({error:"Select a course and 1–200 students"},400,h);
  const course=await env.DB.prepare("SELECT id FROM courses WHERE id=? AND status='published'").bind(courseId).first();if(!course)return json({error:"Choose a published course"},400,h);
  const statements=[];for(const id of ids){const s=await env.DB.prepare("SELECT id FROM users WHERE id=? AND role='student' AND status='active'").bind(id).first();if(s)statements.push(env.DB.prepare("INSERT OR IGNORE INTO enrollments(id,student_id,course_id,status) VALUES(?,?,?,'active')").bind(crypto.randomUUID(),id,courseId));}
  if(statements.length)await env.DB.batch(statements);return json({ok:true,processed:statements.length,selected:ids.length},200,h);
 }
 const adminRecord=path.match(/^\/api\/(students|courses|enrollments|materials|zoom-classes|announcements|assignments)\/([^/]+)$/);
 if(adminRecord&&(req.method==="PATCH"||req.method==="DELETE")){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const type=adminRecord[1],id=adminRecord[2];
  if(req.method==="PATCH"){
   const b=await getBody(req);let result;
   if(type==="students"){
    const name=String(b.full_name||"").trim(),email=String(b.email||"").trim().toLowerCase(),phone=String(b.phone||"").trim(),status=String(b.status||"active");
    if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!["active","inactive","suspended"].includes(status))return json({error:"Enter valid student details"},400,h);
    result=await env.DB.prepare("UPDATE users SET full_name=?,email=?,phone=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND role='student'").bind(name,email,phone||null,status,id).run();
   }else if(type==="courses"){
    const title=String(b.title||"").trim(),code=String(b.course_code||"").trim().toUpperCase(),fee=Number(b.fee_amount),status=String(b.status||"draft");
    if(!title||!code||!Number.isFinite(fee)||fee<0||!["draft","published","archived"].includes(status))return json({error:"Enter valid course details"},400,h);
    result=await env.DB.prepare("UPDATE courses SET title=?,course_code=?,description=?,fee_amount=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(title,code,String(b.description||""),fee,status,id).run();
   }else if(type==="enrollments"){
    const status=String(b.status||"");if(!["pending","active","completed","cancelled"].includes(status))return json({error:"Invalid enrolment status"},400,h);
    result=await env.DB.prepare("UPDATE enrollments SET status=? WHERE id=?").bind(status,id).run();
   }else if(type==="materials"){
    const title=String(b.title||"").trim();if(!title)return json({error:"Title is required"},400,h);
    result=await env.DB.prepare("UPDATE learning_materials SET title=? WHERE id=?").bind(title,id).run();
   }else if(type==="zoom-classes"){
    const title=String(b.title||"").trim(),url=String(b.meeting_url||""),starts=String(b.starts_at||""),duration=Number(b.duration_minutes);let parsed;try{parsed=new URL(url)}catch{return json({error:"Invalid meeting URL"},400,h)}
    if(!title||parsed.protocol!=="https:"||!starts||!Number.isInteger(duration)||duration<1||duration>720)return json({error:"Enter valid class details"},400,h);
    result=await env.DB.prepare("UPDATE zoom_classes SET title=?,meeting_url=?,starts_at=?,duration_minutes=? WHERE id=?").bind(title,url,starts,duration,id).run();
   }else if(type==="announcements"){
    const title=String(b.title||"").trim(),body=String(b.body||"").trim(),audience=String(b.audience||"all");if(!title||!body||!["all","students","lecturers"].includes(audience))return json({error:"Enter valid announcement details"},400,h);
    result=await env.DB.prepare("UPDATE announcements SET title=?,body=?,audience=? WHERE id=?").bind(title,body,audience,id).run();
   }else if(type==="assignments"){
    const title=String(b.title||"").trim(),course=String(b.course_id||"");if(!title||!course)return json({error:"Course and title are required"},400,h);
    result=await env.DB.prepare("UPDATE assignments SET title=?,description=?,due_at=?,course_id=? WHERE id=?").bind(title,String(b.description||""),String(b.due_at||"")||null,course,id).run();
   }
   if(!result?.meta?.changes)return json({error:"Record not found or unchanged"},404,h);return json({ok:true},200,h);
  }
  if(type==="students"){const r=await env.DB.prepare("UPDATE users SET status='inactive',updated_at=CURRENT_TIMESTAMP WHERE id=? AND role='student'").bind(id).run();if(!r.meta?.changes)return json({error:"Student not found"},404,h);await env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(id).run();return json({ok:true,archived:true},200,h);}
  if(type==="courses"){const deps=await env.DB.prepare("SELECT (SELECT COUNT(*) FROM enrollments WHERE course_id=?)+(SELECT COUNT(*) FROM learning_materials WHERE course_id=?)+(SELECT COUNT(*) FROM assignments WHERE course_id=?)+(SELECT COUNT(*) FROM zoom_classes WHERE course_id=?) n").bind(id,id,id,id).first();if(deps.n)return json({error:"Course has linked records. Archive it instead of deleting."},409,h);const r=await env.DB.prepare("DELETE FROM courses WHERE id=?").bind(id).run();if(!r.meta?.changes)return json({error:"Course not found"},404,h);return json({ok:true},200,h);}
  if(type==="materials"){const row=await env.DB.prepare("SELECT file_key FROM learning_materials WHERE id=?").bind(id).first();if(!row)return json({error:"Material not found"},404,h);await env.DB.prepare("DELETE FROM learning_materials WHERE id=?").bind(id).run();if(row.file_key)await env.FILES.delete(row.file_key);return json({ok:true},200,h);}
  if(type==="assignments"){const subs=await env.DB.prepare("SELECT file_key FROM submissions WHERE assignment_id=?").bind(id).all();await env.DB.prepare("DELETE FROM submissions WHERE assignment_id=?").bind(id).run();for(const s of subs.results||[])if(s.file_key)await env.FILES.delete(s.file_key);const r=await env.DB.prepare("DELETE FROM assignments WHERE id=?").bind(id).run();if(!r.meta?.changes)return json({error:"Assignment not found"},404,h);return json({ok:true},200,h);}
  const table={enrollments:"enrollments","zoom-classes":"zoom_classes",announcements:"announcements"}[type];const r=await env.DB.prepare("DELETE FROM "+table+" WHERE id=?").bind(id).run();if(!r.meta?.changes)return json({error:"Record not found"},404,h);return json({ok:true},200,h);
 }

 if(path.startsWith("/api/materials/")&&path.endsWith("/replace")&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const id=path.split("/")[3],form=await req.formData(),file=form.get("file");
  if(!(file instanceof File)||file.size>20*1024*1024)return json({error:"Choose a file up to 20 MB"},400,h);
  const allowed=["application/pdf","image/jpeg","image/png","video/mp4","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if(!allowed.includes(file.type))return json({error:"Unsupported file type"},400,h);
  const old=await env.DB.prepare("SELECT file_key FROM learning_materials WHERE id=?").bind(id).first();if(!old)return json({error:"Material not found"},404,h);
  const key="materials/"+id+"/"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");await env.FILES.put(key,file.stream(),{httpMetadata:{contentType:file.type}});
  await env.DB.prepare("UPDATE learning_materials SET file_key=?,file_type=?,file_size=? WHERE id=?").bind(key,file.type,file.size,id).run();
  if(old.file_key)await env.FILES.delete(old.file_key);return json({ok:true},200,h);
 }
 if(path.startsWith("/api/payments/")&&path.endsWith("/receipt")&&req.method==="GET"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const id=path.split("/")[3],row=await env.DB.prepare("SELECT receipt_key FROM payments WHERE id=?").bind(id).first();if(!row?.receipt_key)return json({error:"Receipt not found"},404,h);
  const obj=await env.FILES.get(row.receipt_key);if(!obj)return json({error:"Receipt file missing"},404,h);
  return new Response(obj.body,{status:200,headers:{...h,"content-type":obj.httpMetadata?.contentType||"application/octet-stream","content-disposition":"inline","cache-control":"private, no-store"}});
 }

 if(path==="/api/assessments"&&req.method==="GET"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const rows=await env.DB.prepare("SELECT a.*,c.course_code,c.title course_title,(SELECT COUNT(*) FROM assessment_questions q WHERE q.assessment_id=a.id) question_count FROM assessments a LEFT JOIN courses c ON c.id=a.course_id ORDER BY a.created_at DESC").all();
  return json(rows.results||[],200,h);
 }
 if(path==="/api/assessments"&&req.method==="POST"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const b=await getBody(req),course=String(b?.course_id||""),title=String(b?.title||"").trim(),description=String(b?.description||""),duration=Number(b?.duration_minutes||30),pass=Number(b?.pass_mark||0),questions=Array.isArray(b?.questions)?b.questions:[];
  if(!course||!title||!Number.isInteger(duration)||duration<1||duration>300||questions.length<1||questions.length>100)return json({error:"Enter a title, course, duration and 1–100 questions"},400,h);
  const cr=await env.DB.prepare("SELECT id FROM courses WHERE id=?").bind(course).first();if(!cr)return json({error:"Course not found"},404,h);
  let total=0;const valid=[];
  for(const q of questions){const question=String(q.question||"").trim(),opts=[q.option_a,q.option_b,q.option_c,q.option_d].map(x=>String(x||"").trim()),correct=String(q.correct_option||"").toLowerCase(),marks=Number(q.marks||1);if(!question||!opts[0]||!opts[1]||!["a","b","c","d"].includes(correct)||!opts[["a","b","c","d"].indexOf(correct)]||!Number.isInteger(marks)||marks<1)return json({error:"Each question needs text, at least two options, a correct answer and positive marks"},400,h);valid.push({question,opts,correct,marks});total+=marks;}
  if(!Number.isInteger(pass)||pass<0||pass>total)return json({error:"Pass mark must be between 0 and total marks"},400,h);
  const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO assessments(id,course_id,title,description,duration_minutes,total_marks,pass_mark,status,created_by) VALUES(?,?,?,?,?,?,?,'published',?)").bind(id,course,title,description,duration,total,pass,u.id).run();
  await env.DB.batch(valid.map(q=>env.DB.prepare("INSERT INTO assessment_questions(id,assessment_id,question,option_a,option_b,option_c,option_d,correct_option,marks) VALUES(?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,q.question,q.opts[0],q.opts[1],q.opts[2]||null,q.opts[3]||null,q.correct,q.marks)));
  return json({ok:true,id,total_marks:total,question_count:valid.length},201,h);
 }

 if(path.match(/^\/api\/assessments\/[^/]+\/attempts$/)&&req.method==="GET"){
  if(u.role!=="admin")return json({error:"Admin access required"},403,h);
  const id=path.split("/")[3];
  const rows=await env.DB.prepare("SELECT t.id,t.score,t.total_marks,t.passed,t.submitted_at,u.full_name,u.student_number,a.title assessment_title FROM assessment_attempts t JOIN users u ON u.id=t.student_id JOIN assessments a ON a.id=t.assessment_id WHERE t.assessment_id=? ORDER BY t.submitted_at DESC").bind(id).all();
  return json(rows.results||[],200,h);
 }
 if(path.match(/^\/api\/assessments\/[^/]+\/questions$/)&&req.method==="GET"){
  if(u.role!=="student")return json({error:"Student access required"},403,h);
  const id=path.split("/")[3];
  const assessment=await env.DB.prepare("SELECT a.id,a.title,a.description,a.duration_minutes,a.total_marks,a.pass_mark,c.title course_title FROM assessments a JOIN courses c ON c.id=a.course_id JOIN enrollments e ON e.course_id=a.course_id AND e.student_id=? AND e.status='active' WHERE a.id=? AND a.status='published'").bind(u.id,id).first();
  if(!assessment)return json({error:"Assessment not available for your account"},404,h);
  const questions=await env.DB.prepare("SELECT id,question,option_a,option_b,option_c,option_d,marks FROM assessment_questions WHERE assessment_id=? ORDER BY rowid").bind(id).all();
  return json({assessment,questions:questions.results||[]},200,h);
 }
 if(path.match(/^\/api\/student\/assessments\/[^/]+\/submit$/)&&req.method==="POST"){
  if(u.role!=="student")return json({error:"Student access required"},403,h);
  const id=path.split("/")[4],b=await getBody(req),answers=b?.answers;
  const assessment=await env.DB.prepare("SELECT a.id,a.total_marks,a.pass_mark FROM assessments a JOIN enrollments e ON e.course_id=a.course_id AND e.student_id=? AND e.status='active' WHERE a.id=? AND a.status='published'").bind(u.id,id).first();
  if(!assessment)return json({error:"Assessment not available"},404,h);
  if(!answers||typeof answers!=="object"||Array.isArray(answers))return json({error:"Submit your answers"},400,h);
  const questions=await env.DB.prepare("SELECT id,correct_option,marks FROM assessment_questions WHERE assessment_id=?").bind(id).all();
  if(!questions.results?.length)return json({error:"Assessment has no questions"},400,h);
  const prior=await env.DB.prepare("SELECT id FROM assessment_attempts WHERE assessment_id=? AND student_id=?").bind(id,u.id).first();
  if(prior)return json({error:"You have already submitted this assessment"},409,h);
  let score=0;const safe={};
  for(const q of questions.results){const answer=String(answers[q.id]||"").toLowerCase();if(!["a","b","c","d"].includes(answer))return json({error:"Please answer every question"},400,h);safe[q.id]=answer;if(answer===q.correct_option)score+=Number(q.marks);}
  const attempt=crypto.randomUUID(),passed=score>=Number(assessment.pass_mark)?1:0;
  await env.DB.prepare("INSERT INTO assessment_attempts(id,assessment_id,student_id,score,total_marks,passed,answers_json) VALUES(?,?,?,?,?,?,?)").bind(attempt,id,u.id,score,Number(assessment.total_marks),passed,JSON.stringify(safe)).run();
  return json({ok:true,score,total_marks:Number(assessment.total_marks),pass_mark:Number(assessment.pass_mark),passed:!!passed,submitted_at:new Date().toISOString()},201,h);
 }
 if(path==="/api/student/assessment-results"&&req.method==="GET"){
  if(u.role!=="student")return json({error:"Student access required"},403,h);
  const rows=await env.DB.prepare("SELECT t.id,t.score,t.total_marks,t.passed,t.submitted_at,a.title assessment_title FROM assessment_attempts t JOIN assessments a ON a.id=t.assessment_id WHERE t.student_id=? ORDER BY t.submitted_at DESC").bind(u.id).all();
  return json(rows.results||[],200,h);
 }
 if(path==="/api/student/assessments"&&req.method==="GET"){
  if(u.role!=="student")return json({error:"Student access required"},403,h);
  const rows=await env.DB.prepare("SELECT a.id,a.title,a.description,a.duration_minutes,a.total_marks,a.pass_mark,c.course_code,c.title course_title,(SELECT COUNT(*) FROM assessment_questions q WHERE q.assessment_id=a.id) question_count FROM assessments a JOIN enrollments e ON e.course_id=a.course_id AND e.student_id=? AND e.status='active' JOIN courses c ON c.id=a.course_id WHERE a.status='published' ORDER BY a.created_at DESC").bind(u.id).all();
  return json(rows.results||[],200,h);
 }
 if(path==="/api/dashboard"){const q=await Promise.all(["SELECT COUNT(*) n FROM users WHERE role='student'","SELECT COUNT(*) n FROM courses WHERE status='published'","SELECT COUNT(*) n FROM payments WHERE status='pending'","SELECT COUNT(*) n FROM zoom_classes WHERE starts_at>=CURRENT_TIMESTAMP"].map(s=>env.DB.prepare(s).first()));return json({students:q[0].n,courses:q[1].n,pending_payments:q[2].n,upcoming_classes:q[3].n},200,h);}
 const sql={"/api/students":"SELECT id,student_number,full_name,email,phone,status,created_at FROM users WHERE role='student' ORDER BY created_at DESC","/api/courses":"SELECT * FROM courses ORDER BY created_at DESC","/api/zoom-classes":"SELECT z.*,c.title course_title FROM zoom_classes z LEFT JOIN courses c ON c.id=z.course_id ORDER BY z.starts_at DESC","/api/payments":"SELECT p.*,u.full_name student_name,c.title course_title FROM payments p LEFT JOIN users u ON u.id=p.student_id LEFT JOIN courses c ON c.id=p.course_id ORDER BY p.created_at DESC","/api/announcements":"SELECT * FROM announcements ORDER BY created_at DESC"};
 if(req.method==="GET"&&sql[path]){const result=await env.DB.prepare(sql[path]).all();return json(result.results,200,h);}
 return json({error:"Route not found"},404,h);
 }catch(e){console.error("Sterling LMS API error:",e);if(path==="/auth/bootstrap")return json({error:"Admin setup failed",detail:String(e?.message||e)},500,h);return json({error:"Internal server error"},500,h);}
}};
