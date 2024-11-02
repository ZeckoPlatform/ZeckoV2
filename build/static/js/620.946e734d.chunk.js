"use strict";(self.webpackChunkzeckov2=self.webpackChunkzeckov2||[]).push([[620],{620:(e,t,i)=>{i.r(t),i.d(t,{default:()=>g});var o=i(43),n=i(574),c=i(270),r=i(971),a=i(579);const s=n.Ay.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`,l=n.Ay.section`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`,d=n.Ay.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:disabled {
    background-color: #ccc;
  }
`,h=n.Ay.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin: 10px 0;
`,g=()=>{const{user:e}=(0,c.As)(),[t,i]=(0,o.useState)({twoFactorEnabled:!1,emailNotifications:!0,loginAlerts:!0}),[n,g]=(0,o.useState)(!0),[p,x]=(0,o.useState)(null),u=(0,r.Zp)();(0,o.useEffect)((()=>{k()}),[]);const k=async()=>{try{const e=await fetch("/api/security-settings",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});if(!e.ok)throw new Error("Failed to fetch security settings");const t=await e.json();i(t)}catch(e){x(e.message)}finally{g(!1)}},y=async(e,t)=>{try{if(!(await fetch("/api/security-settings",{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`},body:JSON.stringify({[e]:t})})).ok)throw new Error("Failed to update setting");i((i=>({...i,[e]:t})))}catch(o){x(o.message)}};return n?(0,a.jsx)("div",{children:"Loading..."}):p?(0,a.jsxs)("div",{children:["Error: ",p]}):(0,a.jsxs)(s,{children:[(0,a.jsx)("h1",{children:"Security Settings"}),(0,a.jsxs)(l,{children:[(0,a.jsx)("h2",{children:"Two-Factor Authentication"}),(0,a.jsxs)(h,{children:[(0,a.jsx)("input",{type:"checkbox",checked:t.twoFactorEnabled,onChange:e=>y("twoFactorEnabled",e.target.checked)}),"Enable Two-Factor Authentication"]}),t.twoFactorEnabled&&(0,a.jsx)(d,{onClick:()=>{},children:"Setup 2FA"})]}),(0,a.jsxs)(l,{children:[(0,a.jsx)("h2",{children:"Notifications"}),(0,a.jsxs)(h,{children:[(0,a.jsx)("input",{type:"checkbox",checked:t.emailNotifications,onChange:e=>y("emailNotifications",e.target.checked)}),"Email Notifications"]}),(0,a.jsxs)(h,{children:[(0,a.jsx)("input",{type:"checkbox",checked:t.loginAlerts,onChange:e=>y("loginAlerts",e.target.checked)}),"Login Alerts"]})]}),(0,a.jsxs)(l,{children:[(0,a.jsx)("h2",{children:"Recent Activity"}),(0,a.jsxs)("p",{children:["Last login: ",(null===e||void 0===e?void 0:e.lastLogin)||"Never"]}),(0,a.jsx)(d,{onClick:()=>{u("/activity-log")},children:"View Full Activity Log"})]})]})}}}]);
//# sourceMappingURL=620.946e734d.chunk.js.map