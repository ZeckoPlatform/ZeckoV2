"use strict";(self.webpackChunkzeckov2=self.webpackChunkzeckov2||[]).push([[103],{103:(e,r,i)=>{i.r(r),i.d(r,{default:()=>j});var t=i(43),a=i(574),o=i(318),n=i(579);const s=a.Ay.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`,c=a.Ay.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`,l=a.Ay.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
`,d=a.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`,p=a.Ay.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: white;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`,h=a.Ay.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
`,u=a.Ay.div`
  margin-top: 10px;
`,x=a.Ay.h3`
  margin: 0;
  color: var(--primary-color);
`,g=a.Ay.p`
  font-weight: bold;
  color: #333;
`;const j=function(){const[e,r]=(0,t.useState)([]),[i,a]=(0,t.useState)(!0),[j,v]=(0,t.useState)(null),[m,y]=(0,t.useState)({category:"",priceRange:"",sortBy:"newest"});(0,t.useEffect)((()=>{w()}),[]);const w=async()=>{try{const e=await fetch("/api/shop/products");if(!e.ok)throw new Error("Failed to fetch products");const i=await e.json();r(i)}catch(e){v(e.message)}finally{a(!1)}},f=e=>{y({...m,[e.target.name]:e.target.value})},b=e.filter((e=>!m.category||e.category===m.category)).filter((e=>{if(!m.priceRange)return!0;const[r,i]=m.priceRange.split("-").map(Number);return e.price>=r&&e.price<=i})).sort(((e,r)=>{switch(m.sortBy){case"price-low":return e.price-r.price;case"price-high":return r.price-e.price;case"newest":return new Date(r.createdAt)-new Date(e.createdAt);default:return 0}}));return i?(0,n.jsx)("div",{children:"Loading..."}):j?(0,n.jsxs)("div",{children:["Error: ",j]}):(0,n.jsxs)(s,{children:[(0,n.jsx)("h1",{children:"Shop"}),(0,n.jsxs)(c,{children:[(0,n.jsxs)(l,{name:"category",value:m.category,onChange:f,children:[(0,n.jsx)("option",{value:"",children:"All Categories"}),(0,n.jsx)("option",{value:"tools",children:"Tools"}),(0,n.jsx)("option",{value:"materials",children:"Materials"}),(0,n.jsx)("option",{value:"equipment",children:"Equipment"})]}),(0,n.jsxs)(l,{name:"priceRange",value:m.priceRange,onChange:f,children:[(0,n.jsx)("option",{value:"",children:"All Prices"}),(0,n.jsx)("option",{value:"0-50",children:"$0 - $50"}),(0,n.jsx)("option",{value:"51-100",children:"$51 - $100"}),(0,n.jsx)("option",{value:"101-500",children:"$101 - $500"}),(0,n.jsx)("option",{value:"501-1000",children:"$501 - $1000"})]}),(0,n.jsxs)(l,{name:"sortBy",value:m.sortBy,onChange:f,children:[(0,n.jsx)("option",{value:"newest",children:"Newest First"}),(0,n.jsx)("option",{value:"price-low",children:"Price: Low to High"}),(0,n.jsx)("option",{value:"price-high",children:"Price: High to Low"})]})]}),(0,n.jsx)(d,{children:b.map((e=>(0,n.jsx)(p,{children:(0,n.jsxs)(o.N_,{to:`/shop/product/${e._id}`,children:[(0,n.jsx)(h,{src:e.image,alt:e.name}),(0,n.jsxs)(u,{children:[(0,n.jsx)(x,{children:e.name}),(0,n.jsxs)(g,{children:["$",e.price]})]})]})},e._id)))})]})}}}]);
//# sourceMappingURL=103.c2520e9c.chunk.js.map