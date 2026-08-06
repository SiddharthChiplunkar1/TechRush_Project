import GlassCard from "../../common/GlassCard/GlassCard";

const stats = [

{

number:"2M+",

title:"Secure Logins"

},

{

number:"99.99%",

title:"Uptime"

},

{

number:"0",

title:"Passwords Stored"

},

{

number:"98%",

title:"Fraud Detection"

}

];

const HeroStats=()=>{

return(

<div className="grid gap-6 py-20 md:grid-cols-2 xl:grid-cols-4">

{

stats.map((item)=>(

<GlassCard key={item.title}>

<h2 className="text-4xl font-bold text-orange-500">

{item.number}

</h2>

<p className="mt-2 text-zinc-400">

{item.title}

</p>

</GlassCard>

))

}

</div>

)

}

export default HeroStats;