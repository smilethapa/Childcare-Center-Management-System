/* LittleSteps Childcare Center Management System
   Front-end college project: HTML + CSS + Vanilla JavaScript + LocalStorage.
   Demo data is fictional. Do not store real children's sensitive information here. */
const STORE_KEY = "littlesteps_childcare_v1";
const todayISO = () => new Date().toISOString().slice(0,10);
const uid = () => "LS" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
const seed = {
  children:[
    {id:"C101",name:"Olivia Bennett",dob:"2021-04-12",classroom:"Sunshine Room",guardian:"Emma Bennett",phone:"9876543210",allergies:"Peanuts",status:"Active"},
    {id:"C102",name:"Noah Williams",dob:"2020-11-03",classroom:"Rainbow Room",guardian:"James Williams",phone:"9876501234",allergies:"None",status:"Active"},
    {id:"C103",name:"Ava Patel",dob:"2022-02-19",classroom:"Sunshine Room",guardian:"Priya Patel",phone:"9876512345",allergies:"Dairy",status:"Active"},
    {id:"C104",name:"Liam Garcia",dob:"2021-08-25",classroom:"Little Explorers",guardian:"Sofia Garcia",phone:"9876523456",allergies:"None",status:"Active"},
    {id:"C105",name:"Mia Thompson",dob:"2020-06-10",classroom:"Rainbow Room",guardian:"Daniel Thompson",phone:"9876534567",allergies:"Eggs",status:"Active"}
  ],
  guardians:[
    {id:"G201",name:"Emma Bennett",relation:"Mother",phone:"9876543210",email:"emma@example.com",child:"Olivia Bennett",address:"12 Rose Avenue"},
    {id:"G202",name:"James Williams",relation:"Father",phone:"9876501234",email:"james@example.com",child:"Noah Williams",address:"8 Lake Road"},
    {id:"G203",name:"Priya Patel",relation:"Mother",phone:"9876512345",email:"priya@example.com",child:"Ava Patel",address:"41 Green Street"}
  ],
  attendance:[
    {id:"A301",child:"Olivia Bennett",date:todayISO(),checkIn:"08:35",checkOut:"",status:"Present"},
    {id:"A302",child:"Noah Williams",date:todayISO(),checkIn:"08:48",checkOut:"",status:"Present"},
    {id:"A303",child:"Ava Patel",date:todayISO(),checkIn:"09:02",checkOut:"",status:"Present"},
    {id:"A304",child:"Liam Garcia",date:todayISO(),checkIn:"",checkOut:"",status:"Absent"}
  ],
  pickups:[
    {id:"P401",child:"Olivia Bennett",person:"Emma Bennett",relation:"Mother",date:todayISO(),time:"15:30",status:"Approved"},
    {id:"P402",child:"Noah Williams",person:"James Williams",relation:"Father",date:todayISO(),time:"15:45",status:"Approved"}
  ],
  activities:[
    {id:"ACT1",title:"Creative drawing",room:"Sunshine Room",time:"09:30",date:todayISO(),description:"Free drawing and colour exploration",status:"Completed"},
    {id:"ACT2",title:"Story time",room:"Rainbow Room",time:"11:00",date:todayISO(),description:"Interactive picture book session",status:"Scheduled"},
    {id:"ACT3",title:"Outdoor play",room:"All rooms",time:"14:00",date:todayISO(),description:"Supervised playground activities",status:"Scheduled"}
  ],
  meals:[
    {id:"M501",child:"Olivia Bennett",date:todayISO(),meal:"Breakfast",menu:"Oatmeal and banana",consumed:"All"},
    {id:"M502",child:"Noah Williams",date:todayISO(),meal:"Breakfast",menu:"Toast and fruit",consumed:"Most"},
    {id:"M503",child:"Ava Patel",date:todayISO(),meal:"Lunch",menu:"Vegetable rice",consumed:"Some"}
  ],
  health:[
    {id:"H601",child:"Olivia Bennett",date:todayISO(),type:"Allergy",note:"Peanut allergy — avoid all peanut products",action:"Kitchen and classroom informed"},
    {id:"H602",child:"Liam Garcia",date:todayISO(),type:"Observation",note:"Small bruise on left knee noticed at arrival",action:"Guardian informed"}
  ],
  notifications:[
    {id:"N701",title:"Pickup reminder",message:"Confirm authorized pickup details before releasing a child.",date:todayISO(),type:"Reminder",read:false},
    {id:"N702",title:"Health note added",message:"A health observation was recorded for Liam Garcia.",date:todayISO(),type:"Health",read:false}
  ]
};
let db = loadData();
let currentPage = "dashboard";
let editing = null;
let modalType = null;
function loadData(){try{const raw=localStorage.getItem(STORE_KEY);return raw?JSON.parse(raw):structuredClone(seed)}catch(e){return structuredClone(seed)}}
function saveData(){localStorage.setItem(STORE_KEY,JSON.stringify(db));updateNotificationCount()}
function updateNotificationCount(){const el=document.getElementById("notificationCount");if(el)el.textContent=db.notifications.filter(n=>!n.read).length}
function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function initials(name=""){return name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()}
function fmtDate(d){if(!d)return "—";return new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
function toast(msg,kind="success"){const el=document.createElement("div");el.className="toast "+kind;el.textContent=msg;document.getElementById("toastRegion").append(el);setTimeout(()=>el.remove(),3000)}
function setPage(page){currentPage=page;document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));document.getElementById("sidebar").classList.remove("open");renderPage()}
function renderPage(){
 const titles={dashboard:"Good morning, Alex",children:"Child Profiles",guardians:"Guardian Management",attendance:"Attendance Management",pickup:"Authorized Pickup",activities:"Daily Activities",meals:"Meal Records",health:"Health Records",notifications:"Notifications"};
 document.getElementById("pageTitle").innerHTML=titles[currentPage]+(currentPage==="dashboard"?' <span class="wave">✦</span>':"");
 const now=new Date();document.getElementById("todayLabel").textContent=now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
 const views={dashboard:dashboardView,children:childrenView,guardians:guardiansView,attendance:attendanceView,pickup:pickupView,activities:activitiesView,meals:mealsView,health:healthView,notifications:notificationsView};
 document.getElementById("pageContent").innerHTML=views[currentPage]();updateNotificationCount();
}
function stat(label,value,icon,tone,foot){return `<article class="stat-card"><div class="stat-top">${label}<span class="stat-icon ${tone}">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></article>`}
function dashboardView(){
 const present=db.attendance.filter(a=>a.date===todayISO()&&a.status==="Present").length;
 const absent=db.attendance.filter(a=>a.date===todayISO()&&a.status==="Absent").length;
 const active=db.children.filter(c=>c.status==="Active").length;
 const pending=db.pickups.filter(p=>p.date===todayISO()&&p.status==="Pending").length;
 const latest=db.attendance.filter(a=>a.date===todayISO()).slice(0,5);
 const activity=db.activities.slice(0,4);
 const bars=[48,70,62,86,76,94,68];
 return `<div class="welcome-row"><div><h2>Your center at a glance</h2><p>Here's what's happening at your childcare center today.</p></div><button class="btn btn-primary" data-add="children">＋ Add a child</button></div>
 <div class="stats-grid">${stat("ENROLLED CHILDREN",active,"♧","tone-purple","<strong>●</strong> Active registrations")}${stat("PRESENT TODAY",present,"✓","tone-green",`${absent} absent today`)}${stat("ABSENT TODAY",absent,"◷","tone-orange","Attendance overview")}${stat("PENDING PICKUPS",pending,"↗","tone-blue","Awaiting pickup verification")}</div>
 <div class="dashboard-grid"><section class="panel"><div class="panel-heading"><div><h3>Attendance overview</h3><p>Weekly attendance activity</p></div><span class="status neutral">This week</span></div><div class="attendance-chart">${bars.map((v,i)=>`<div class="chart-day"><div class="bar-track"><div class="bar-fill" style="height:${v}%"></div></div><span>${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span></div>`).join("")}</div><div class="chart-legend"><span><i class="legend-dot"></i> Attendance rate</span><span><i class="legend-dot pale"></i> Weekly overview</span></div></section>
 <section class="panel"><div class="panel-heading"><div><h3>Today's activity</h3><p>What is coming up</p></div><button class="text-link" data-page="activities">View all →</button></div><div class="activity-list">${activity.length?activity.map(a=>`<div class="activity-item"><div class="activity-symbol tone-purple">✳</div><div><strong>${escapeHTML(a.title)}</strong><small>${escapeHTML(a.room)} · ${escapeHTML(a.status)}</small></div><span class="activity-time">${escapeHTML(a.time)}</span></div>`).join(""):'<div class="empty-state">No activities scheduled yet.</div>'}</div></section></div>
 <div class="bottom-grid"><section class="panel"><div class="panel-heading"><div><h3>Today's attendance</h3><p>Latest check-in records</p></div><button class="text-link" data-page="attendance">Manage attendance →</button></div>${latest.length?`<div class="table-wrap"><table><thead><tr><th>CHILD</th><th>CHECK IN</th><th>CHECK OUT</th><th>STATUS</th></tr></thead><tbody>${latest.map(a=>`<tr><td><div class="child-cell"><div class="child-avatar">${initials(a.child)}</div><strong>${escapeHTML(a.child)}</strong></div></td><td>${a.checkIn||"—"}</td><td>${a.checkOut||"—"}</td><td>${statusPill(a.status)}</td></tr>`).join("")}</tbody></table></div>`:'<div class="empty-state">No attendance records for today.</div>'}</section>
 <section class="panel"><div class="panel-heading"><div><h3>Quick actions</h3><p>Jump into a common task</p></div></div><div class="quick-grid"><button class="quick-action" data-add="attendance"><span>◷</span><div><strong>Mark attendance</strong><small>Check-in a child</small></div></button><button class="quick-action" data-add="pickup"><span>↗</span><div><strong>Record pickup</strong><small>Verify a guardian</small></div></button><button class="quick-action" data-add="meals"><span>♨</span><div><strong>Add meal record</strong><small>Update food log</small></div></button><button class="quick-action" data-add="health"><span>♡</span><div><strong>Add health note</strong><small>Log an observation</small></div></button></div></section></div>`;
}
function statusPill(s){let cls=String(s).toLowerCase();if(!["present","absent","pending","approved","completed","scheduled","active","inactive","all","most","some","not eaten"].includes(cls))cls="neutral";return `<span class="status ${cls}">${escapeHTML(s||"—")}</span>`}
const configs={
 children:{title:"Child Profiles",subtitle:"Manage enrolled children and their essential information.",add:"Add child",key:"children",fields:[["name","Child's full name","text",true],["dob","Date of birth","date",true],["classroom","Classroom","select",true,["Sunshine Room","Rainbow Room","Little Explorers","All rooms"]],["guardian","Primary guardian","text",true],["phone","Guardian phone","tel",true],["allergies","Allergies / dietary notes","text",false],["status","Enrollment status","select",true,["Active","Inactive"]]],cols:["CHILD","DATE OF BIRTH","CLASSROOM","GUARDIAN","PHONE","STATUS"]},
 guardians:{title:"Guardians",subtitle:"Keep parent and authorized guardian contact information up to date.",add:"Add guardian",key:"guardians",fields:[["name","Guardian full name","text",true],["relation","Relationship","select",true,["Mother","Father","Guardian","Grandparent","Other"]],["phone","Phone number","tel",true],["email","Email address","email",false],["child","Child","select",true,()=>db.children.map(c=>c.name)],["address","Address","text",false]],cols:["GUARDIAN","RELATIONSHIP","CHILD","PHONE","EMAIL"]},
 attendance:{title:"Attendance",subtitle:"Track daily arrivals, departures and attendance status.",add:"Mark attendance",key:"attendance",fields:[["child","Child","select",true,()=>db.children.map(c=>c.name)],["date","Date","date",true],["checkIn","Check-in time","time",false],["checkOut","Check-out time","time",false],["status","Attendance status","select",true,["Present","Absent"]]],cols:["CHILD","DATE","CHECK IN","CHECK OUT","STATUS"]},
 pickup:{title:"Authorized Pickup",subtitle:"Record collection details and verify the person picking up each child.",add:"Record pickup",key:"pickups",fields:[["child","Child","select",true,()=>db.children.map(c=>c.name)],["person","Pickup person's full name","text",true],["relation","Relationship","text",true],["date","Pickup date","date",true],["time","Pickup time","time",true],["status","Verification status","select",true,["Approved","Pending","Flagged"]]],cols:["CHILD","PICKUP PERSON","RELATIONSHIP","DATE","TIME","STATUS"]},
 activities:{title:"Daily Activities",subtitle:"Plan and track learning, play and daily classroom activities.",add:"Add activity",key:"activities",fields:[["title","Activity name","text",true],["room","Classroom","select",true,["Sunshine Room","Rainbow Room","Little Explorers","All rooms"]],["date","Date","date",true],["time","Start time","time",true],["description","Description","textarea",false],["status","Activity status","select",true,["Scheduled","Completed","Cancelled"]]],cols:["ACTIVITY","CLASSROOM","DATE","TIME","DESCRIPTION","STATUS"]},
 meals:{title:"Meal Records",subtitle:"Record meals served, food preferences and how much each child ate.",add:"Add meal record",key:"meals",fields:[["child","Child","select",true,()=>db.children.map(c=>c.name)],["date","Date","date",true],["meal","Meal","select",true,["Breakfast","Morning snack","Lunch","Afternoon snack"]],["menu","Food served","text",true],["consumed","Consumption","select",true,["All","Most","Some","Not eaten"]]],cols:["CHILD","DATE","MEAL","FOOD SERVED","CONSUMPTION"]},
 health:{title:"Health Records",subtitle:"Maintain health observations, allergy notes and follow-up actions.",add:"Add health record",key:"health",fields:[["child","Child","select",true,()=>db.children.map(c=>c.name)],["date","Date","date",true],["type","Record type","select",true,["Allergy","Medication","Observation","Incident","Other"]],["note","Health note","textarea",true],["action","Action taken / follow-up","textarea",false]],cols:["CHILD","DATE","TYPE","HEALTH NOTE","ACTION TAKEN"]},
 notifications:{title:"Notifications",subtitle:"Review reminders and important center updates.",add:"Create notification",key:"notifications",fields:[["title","Notification title","text",true],["message","Message","textarea",true],["date","Date","date",true],["type","Category","select",true,["Reminder","Health","Attendance","Pickup","General"]]],cols:["TITLE","MESSAGE","DATE","CATEGORY","READ"]}
};
function getRows(key){return db[key]||[]}
function cellFor(key,row){switch(key){case"children":return `<td><div class="child-cell"><div class="child-avatar">${initials(row.name)}</div><div><strong>${escapeHTML(row.name)}</strong><small>${escapeHTML(row.id)}</small></div></div></td><td>${fmtDate(row.dob)}</td><td>${escapeHTML(row.classroom)}</td><td>${escapeHTML(row.guardian)}</td><td>${escapeHTML(row.phone)}</td><td>${statusPill(row.status)}</td>`;
case"guardians":return `<td><strong>${escapeHTML(row.name)}</strong></td><td>${escapeHTML(row.relation)}</td><td>${escapeHTML(row.child)}</td><td>${escapeHTML(row.phone)}</td><td>${escapeHTML(row.email||"—")}</td>`;
case"attendance":return `<td><strong>${escapeHTML(row.child)}</strong></td><td>${fmtDate(row.date)}</td><td>${row.checkIn||"—"}</td><td>${row.checkOut||"—"}</td><td>${statusPill(row.status)}</td>`;
case"pickups":return `<td><strong>${escapeHTML(row.child)}</strong></td><td>${escapeHTML(row.person)}</td><td>${escapeHTML(row.relation)}</td><td>${fmtDate(row.date)}</td><td>${row.time}</td><td>${statusPill(row.status)}</td>`;
case"activities":return `<td><strong>${escapeHTML(row.title)}</strong></td><td>${escapeHTML(row.room)}</td><td>${fmtDate(row.date)}</td><td>${row.time}</td><td>${escapeHTML(row.description||"—")}</td><td>${statusPill(row.status)}</td>`;
case"meals":return `<td><strong>${escapeHTML(row.child)}</strong></td><td>${fmtDate(row.date)}</td><td>${escapeHTML(row.meal)}</td><td>${escapeHTML(row.menu)}</td><td>${statusPill(row.consumed)}</td>`;
case"health":return `<td><strong>${escapeHTML(row.child)}</strong></td><td>${fmtDate(row.date)}</td><td>${escapeHTML(row.type)}</td><td>${escapeHTML(row.note)}</td><td>${escapeHTML(row.action||"—")}</td>`;
case"notifications":return `<td><strong>${escapeHTML(row.title)}</strong></td><td>${escapeHTML(row.message)}</td><td>${fmtDate(row.date)}</td><td>${escapeHTML(row.type)}</td><td>${row.read?statusPill("Read"):statusPill("Pending")}</td>`}}
function genericView(key){const c=configs[key],rows=getRows(key);return `<div class="section-heading"><div><h2>${c.title}</h2><p>${c.subtitle}</p></div><button class="btn btn-primary" data-add="${key}">＋ ${c.add}</button></div><div class="toolbar"><div class="toolbar-left"><input class="filter-input" id="tableSearch" placeholder="Search ${c.title.toLowerCase()}..." type="search"><select class="filter-select" id="statusFilter"><option value="">All records</option><option value="today">Today only</option></select></div><div class="toolbar-right"><button class="btn btn-light btn-small" id="exportCsv">↓ Export CSV</button></div></div><section class="page-panel"><div class="table-wrap"><table><thead><tr>${c.cols.map(h=>`<th>${h}</th>`).join("")}<th>ACTIONS</th></tr></thead><tbody id="dataRows">${tableRows(key,rows)}</tbody></table></div></section>`}
function tableRows(key,rows){if(!rows.length)return `<tr><td colspan="10"><div class="empty-state"><b>No records found</b>Use the add button to create your first record.</div></td></tr>`;return rows.map(row=>`<tr data-record-id="${escapeHTML(row.id)}">${cellFor(key,row)}<td><div class="table-actions">${key==="notifications"&&!row.read?`<button class="action-btn" data-mark-read="${row.id}">Mark read</button>`:""}<button class="action-btn" data-edit="${row.id}" data-type="${key}">Edit</button><button class="action-btn delete" data-delete="${row.id}" data-type="${key}">Delete</button></div></td></tr>`).join("")}
function childrenView(){return genericView("children")}function guardiansView(){return genericView("guardians")}function attendanceView(){return genericView("attendance")}function pickupView(){return genericView("pickup")}function activitiesView(){return genericView("activities")}function mealsView(){return genericView("meals")}function healthView(){return genericView("health")}
function notificationsView(){return genericView("notifications")}
function openModal(type,id=null){const c=configs[type];if(!c)return;modalType=type;editing=id;const row=id?db[c.key].find(x=>x.id===id):null;document.getElementById("modalTitle").textContent=(row?"Edit ":"Add ")+c.title.replace(/s$/,"").toLowerCase();document.getElementById("saveRecord").innerHTML=(row?"Update":"Save")+" record <span>→</span>";document.getElementById("modalFields").innerHTML=c.fields.map(([name,label,input,required,opts])=>{let options=typeof opts==="function"?opts():opts;let val=row?.[name]??(name==="date"?todayISO():"");let control=input==="select"?`<select name="${name}" ${required?"required":""}><option value="">Choose ${label.toLowerCase()}</option>${(options||[]).map(o=>`<option ${o===val?"selected":""} value="${escapeHTML(o)}">${escapeHTML(o)}</option>`).join("")}</select>`:input==="textarea"?`<textarea name="${name}" ${required?"required":""}>${escapeHTML(val)}</textarea>`:`<input name="${name}" type="${input}" value="${escapeHTML(val)}" ${required?"required":""}>`;return `<div class="form-field ${input==="textarea"?"full":""}"><label>${label}${required?" *":""}</label>${control}</div>`}).join("");document.getElementById("modalBackdrop").classList.add("show")}
function closeModal(){document.getElementById("modalBackdrop").classList.remove("show");document.getElementById("recordForm").reset();editing=null;modalType=null}
function saveRecord(e){e.preventDefault();const c=configs[modalType],data=Object.fromEntries(new FormData(e.target).entries());if(modalType==="children"&&data.phone&&!/^[0-9+\-\s]{7,16}$/.test(data.phone)){toast("Please enter a valid phone number.","error");return}if(modalType==="children"&&data.dob>todayISO()){toast("Date of birth cannot be in the future.","error");return}if(modalType==="pickup"&&data.status==="Approved"){const child=db.children.find(x=>x.name===data.child);const guardian=db.guardians.some(g=>g.child===data.child&&g.name.toLowerCase()===data.person.toLowerCase());if(child&&child.guardian.toLowerCase()===data.person.toLowerCase()||guardian){/* known guardian */}else if(!confirm("This pickup person is not listed as a primary guardian. Have you independently verified that this person is authorized?"))return}
 if(editing){const i=db[c.key].findIndex(x=>x.id===editing);db[c.key][i]={...db[c.key][i],...data}}else{data.id=uid();if(modalType==="notifications")data.read=false;db[c.key].unshift(data)}
 saveData();closeModal();renderPage();toast(editing?"Record updated successfully":"Record added successfully")}
function deleteRecord(type,id){if(!confirm("Delete this record? This action cannot be undone."))return;const key=configs[type].key;db[key]=db[key].filter(x=>x.id!==id);saveData();renderPage();toast("Record deleted")}
function exportCSV(){const c=configs[currentPage],rows=db[c.key];if(!rows.length){toast("There are no records to export.","error");return}const cols=Object.keys(rows[0]);const csv=[cols.join(","),...rows.map(r=>cols.map(k=>`"${String(r[k]??"").replace(/"/g,'""')}"`).join(","))].join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`littlesteps-${currentPage}-${todayISO()}.csv`;a.click();URL.revokeObjectURL(a.href);toast("CSV export prepared")}
function runSearch(q){const rows=document.querySelectorAll("#dataRows tr[data-record-id]");let visible=0;rows.forEach(tr=>{const show=tr.textContent.toLowerCase().includes(q.toLowerCase());tr.style.display=show?"":"none";if(show)visible++})}
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-page]");if(nav){setPage(nav.dataset.page);return}
 const add=e.target.closest("[data-add]");if(add){openModal(add.dataset.add);return}
 const edit=e.target.closest("[data-edit]");if(edit){openModal(edit.dataset.type,edit.dataset.edit);return}
 const del=e.target.closest("[data-delete]");if(del){deleteRecord(del.dataset.type,del.dataset.delete);return}
 const read=e.target.closest("[data-mark-read]");if(read){const n=db.notifications.find(x=>x.id===read.dataset.markRead);if(n)n.read=true;saveData();renderPage();toast("Notification marked as read");return}
 if(e.target.closest(".close-modal"))closeModal();
});
document.getElementById("recordForm").addEventListener("submit",saveRecord);
document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
document.getElementById("mobileMenu").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("globalSearch").addEventListener("input",e=>{const q=e.target.value.trim();if(!q)return;const found=db.children.find(c=>c.name.toLowerCase().includes(q.toLowerCase()));if(found){setPage("children");const input=document.getElementById("tableSearch");if(input){input.value=q;runSearch(q)}}});
document.getElementById("topNotifications").addEventListener("click",()=>setPage("notifications"));
document.getElementById("helpButton").addEventListener("click",()=>alert("Quick guide:\n1. Add child profiles first.\n2. Add guardians and keep contact details updated.\n3. Record attendance each day.\n4. Verify every pickup independently before releasing a child.\n5. Log meals, activities and health observations.\n\nThis demo stores data in this browser only."));
document.getElementById("pageContent").addEventListener("input",e=>{if(e.target.id==="tableSearch")runSearch(e.target.value)});
document.getElementById("pageContent").addEventListener("change",e=>{if(e.target.id==="statusFilter"){const rows=document.querySelectorAll("#dataRows tr[data-record-id]");rows.forEach(tr=>{const dateCell=tr.children[1]?.textContent||"";tr.style.display=!e.target.value||e.target.value!=="today"||dateCell===fmtDate(todayISO())?"":"none"})}});
document.getElementById("pageContent").addEventListener("click",e=>{if(e.target.closest("#exportCsv"))exportCSV()});
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>setPage(b.dataset.page)));
renderPage();