"use strict";(self.webpackChunkzeckov2_client=self.webpackChunkzeckov2_client||[]).push([[833],{214:(e,t,n)=>{n.r(t),n.d(t,{default:()=>j});var i=n(94),r=n(109),o=n(351),a=n(792),s=n(274);var d=n(678);const c=r.Ay.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`,l=r.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`,p=r.Ay.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
`,x=r.Ay.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-width: 150px;
`,u=r.Ay.div`
  background: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`,h=r.Ay.div`
  flex: 1;
`,f=r.Ay.span`
  background-color: ${e=>{switch(e.type){case"login":return"#e3f2fd";case"security":return"#fff3e0";case"profile":return"#e8f5e9";case"order":return"#f3e5f5";default:return"#f5f5f5"}}};
  color: ${e=>{switch(e.type){case"login":return"#1976d2";case"security":return"#f57c00";case"profile":return"#388e3c";case"order":return"#7b1fa2";default:return"#616161"}}};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-right: 10px;
`,g=r.Ay.time`
  color: #666;
  font-size: 0.9rem;
`,y=r.Ay.div`
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  color: #666;
`,v=r.Ay.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
`,m=r.Ay.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${e=>e.connected?"#4caf50":"#f44336"};
`,b=r.Ay.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #2196f3;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;r.Ay.button`
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 10px;

  &:hover {
    background-color: #f57c00;
  }
`;const j=function(){const{user:e}=(0,o.As)(),[t,n]=(0,i.useState)([]),[r,j]=(0,i.useState)(!0),[w,k]=(0,i.useState)(null),[A,C]=(0,i.useState)(!1),[S,R]=(0,i.useState)(!1),[z,L]=(0,i.useState)({type:"all",dateRange:"week"});(0,i.useEffect)((()=>{T();const e=(0,s.Ol)();C((null===e||void 0===e?void 0:e.connected)||!1);const t=()=>C(!0),i=()=>C(!1),r=e=>{console.error("Socket error:",e),k("Real-time updates unavailable")};null===e||void 0===e||e.on("connect",t),null===e||void 0===e||e.on("disconnect",i),null===e||void 0===e||e.on("error",r);const o=e=>{n((t=>[e,...t].sort(((e,t)=>new Date(t.timestamp)-new Date(e.timestamp))))),R(!0),setTimeout((()=>R(!1)),3e3)};return(0,s.v2)(o),()=>{(0,s.ro)(o),null===e||void 0===e||e.off("connect",t),null===e||void 0===e||e.off("disconnect",i),null===e||void 0===e||e.off("error",r)}}),[z]);const T=async()=>{try{j(!0),k(null);const e=await a.P.getActivityLog(z);n(e)}catch(e){k(e.message)}finally{j(!1)}};return(0,d.jsxs)(c,{children:[(0,d.jsxs)(l,{children:[(0,d.jsx)("h1",{children:"Activity Log"}),(0,d.jsxs)("div",{style:{display:"flex",alignItems:"center"},children:[(0,d.jsxs)(v,{children:[(0,d.jsx)(m,{connected:A}),A?"Real-time updates enabled":(0,d.jsxs)(d.Fragment,{children:["Real-time updates disabled",(0,d.jsx)("button",{onClick:()=>{const e=(0,s.Ol)();e&&e.connect()},children:"Retry"})]})]}),!1]})]}),(0,d.jsxs)(p,{children:[(0,d.jsxs)(x,{name:"type",value:z.type,onChange:handleFilterChange,children:[(0,d.jsx)("option",{value:"all",children:"All Activities"}),(0,d.jsx)("option",{value:"login",children:"Login Activities"}),(0,d.jsx)("option",{value:"security",children:"Security Changes"}),(0,d.jsx)("option",{value:"profile",children:"Profile Updates"}),(0,d.jsx)("option",{value:"order",children:"Order Activities"})]}),(0,d.jsxs)(x,{name:"dateRange",value:z.dateRange,onChange:handleFilterChange,children:[(0,d.jsx)("option",{value:"today",children:"Today"}),(0,d.jsx)("option",{value:"week",children:"This Week"}),(0,d.jsx)("option",{value:"month",children:"This Month"}),(0,d.jsx)("option",{value:"year",children:"This Year"})]})]}),r?(0,d.jsx)("div",{children:"Loading activities..."}):w?(0,d.jsxs)("div",{children:["Error: ",w,(0,d.jsx)("button",{onClick:T,children:"Retry"})]}):0===t.length?(0,d.jsx)(y,{children:"No activities found for the selected filters."}):(0,d.jsxs)(d.Fragment,{children:[t.map((e=>(0,d.jsxs)(u,{children:[(0,d.jsxs)(h,{children:[(0,d.jsx)(f,{type:e.type,children:e.type.charAt(0).toUpperCase()+e.type.slice(1)}),(0,d.jsx)("span",{children:e.description})]}),(0,d.jsx)(g,{children:new Date(e.timestamp).toLocaleString()})]},e.id))),S&&(0,d.jsx)(b,{children:"New activity received!"})]})]})}}}]);