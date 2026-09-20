import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, ChevronDown, CircleHelp, Clock3, Code2, Layers3, List, Plus, RotateCcw, Search, Trash2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./index.css";

const STRUCTURES = {
  Stack: {
    icon: Layers3,
    subtitle: "LIFO — Last In, First Out",
    description: "Elements are added and removed from the same end called the top.",
    operations: ["Push", "Pop", "Peek", "Search", "Clear"],
    time: { Push:"O(1)", Pop:"O(1)", Peek:"O(1)", Search:"O(n)" },
  },
  Queue: {
    icon: List,
    subtitle: "FIFO — First In, First Out",
    description: "Elements enter at the rear and leave from the front.",
    operations: ["Enqueue", "Dequeue", "Front", "Search", "Clear"],
    time: { Enqueue:"O(1)", Dequeue:"O(1)", Front:"O(1)", Search:"O(n)" },
  },
  "Linked List": {
    icon: Code2,
    subtitle: "Dynamic sequential structure",
    description: "Nodes store a value and a pointer to the next node.",
    operations: ["Insert Front", "Insert End", "Delete Front", "Delete End", "Delete At Position", "Insert At Position", "Search", "Clear"],
    time: { "Insert Front":"O(1)", "Insert End":"O(n)", Delete:"O(n)", Search:"O(n)" },
  }
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function App(){
  const [structure,setStructure]=useState("Stack");
  const [items,setItems]=useState(["40","30","20"]);
  const [input,setInput]=useState("");
  const [speed,setSpeed]=useState(5);
  const [message,setMessage]=useState("Choose an operation to start.");
  const [highlight,setHighlight]=useState(null);
  const [history,setHistory]=useState([]);
  const [running,setRunning]=useState(false);
  const [searchValue,setSearchValue]=useState("");
  const [linkedMode,setLinkedMode]=useState("end");

  const meta=STRUCTURES[structure];
  const Icon=meta.icon;

  const changeStructure = name => {
    setStructure(name);
    setItems(name==="Stack"?["40","30","20"]:name==="Queue"?["10","20","30"]:["10","20","30","40"]);
    setMessage(`Switched to ${name}.`);
    setHighlight(null);
    setHistory([]);
  };

  const record=(op,value,result="")=>{
    setHistory(h=>[{op,value,result,time:new Date().toLocaleTimeString()},...h].slice(0,8));
  };

  const animate = async (index,msg)=>{
    setRunning(true);
    setHighlight(index);
    setMessage(msg);
    await sleep(Math.max(100,1100-speed*100));
    setRunning(false);
  };

  const execute = async op => {
    if(running) return;
    const value=input.trim();

    if(["Push","Enqueue","Insert Front","Insert End","Insert At Position"].includes(op) && !value){
      setMessage("Enter a value first."); return;
    }

    if(structure==="Stack"){
      if(op==="Push"){
        const next=[...items,value];
        setItems(next); record("Push",value,"Added to top");
        await animate(next.length-1,`Push ${value}: place it on top of the stack.`);
      } else if(op==="Pop"){
        if(!items.length){setMessage("Stack Underflow — nothing to pop.");return;}
        const v=items[items.length-1];
        await animate(items.length-1,`Pop: remove ${v} from the top.`);
        setItems(items.slice(0,-1)); record("Pop",v,"Removed from top");
      } else if(op==="Peek"){
        if(!items.length){setMessage("Stack is empty.");return;}
        await animate(items.length-1,`Peek: the top element is ${items[items.length-1]}.`);
        record("Peek",items[items.length-1],"Top element");
      } else if(op==="Search"){
        await search(value);
      } else if(op==="Clear"){
        clear();
      }
    }

    if(structure==="Queue"){
      if(op==="Enqueue"){
        const next=[...items,value];
        setItems(next); record("Enqueue",value,"Added at rear");
        await animate(next.length-1,`Enqueue ${value}: add it to the rear of the queue.`);
      } else if(op==="Dequeue"){
        if(!items.length){setMessage("Queue Underflow — nothing to dequeue.");return;}
        const v=items[0];
        await animate(0,`Dequeue: remove ${v} from the front.`);
        setItems(items.slice(1)); record("Dequeue",v,"Removed from front");
      } else if(op==="Front"){
        if(!items.length){setMessage("Queue is empty.");return;}
        await animate(0,`Front: the first element is ${items[0]}.`);
        record("Front",items[0],"Front element");
      } else if(op==="Search"){
        await search(value);
      } else if(op==="Clear"){
        clear();
      }
    }

    if(structure==="Linked List"){
      if(op==="Insert Front"){
        const next=[value,...items];
        setItems(next); record("Insert Front",value,"New head");
        await animate(0,`Insert ${value} at the head of the linked list.`);
      } else if(op==="Insert End"){
        const next=[...items,value];
        setItems(next); record("Insert End",value,"New tail");
        await animate(next.length-1,`Insert ${value} at the end of the linked list.`);
      } else if(op==="Insert At Position"){
        const pos=parseInt(prompt("Enter position (1-based):"),10);
        if(!Number.isInteger(pos)||pos<1||pos>items.length+1){
          setMessage(`Invalid position. Use 1 to ${items.length+1}.`); return;
        }
        const next=[...items];
        next.splice(pos-1,0,value);
        setItems(next); record("Insert At Position",value,`Position ${pos}`);
        await animate(pos-1,`Insert ${value} at position ${pos}.`);
      } else if(op==="Delete Front"){
        if(!items.length){setMessage("Linked list is empty.");return;}
        const v=items[0];
        await animate(0,`Delete Front: remove head node ${v}.`);
        setItems(items.slice(1)); record("Delete Front",v,"Head removed");
      } else if(op==="Delete End"){
        if(!items.length){setMessage("Linked list is empty.");return;}
        const idx=items.length-1, v=items[idx];
        await animate(idx,`Delete End: remove tail node ${v}.`);
        setItems(items.slice(0,-1)); record("Delete End",v,"Tail removed");
      } else if(op==="Delete At Position"){
        const pos=parseInt(prompt("Enter position (1-based):"),10);
        if(!Number.isInteger(pos)||pos<1||pos>items.length){
          setMessage(`Invalid position. Use 1 to ${items.length}.`); return;
        }
        const idx=pos-1, v=items[idx];
        await animate(idx,`Delete node ${v} at position ${pos}.`);
        setItems(items.filter((_,i)=>i!==idx)); record("Delete At Position",v,`Position ${pos}`);
      } else if(op==="Delete"){
        if(!items.length){setMessage("Linked list is empty.");return;}
        const target=value || items[0], idx=items.indexOf(target);
        if(idx<0){setMessage(`${target} was not found.`);return;}
        await animate(idx,`Delete ${target}: unlink the selected node.`);
        setItems(items.filter((_,i)=>i!==idx)); record("Delete",target,"Node removed");
      } else if(op==="Search"){
        await search(value);
      } else if(op==="Clear"){
        clear();
      }
    }
    setInput("");
  };

  const search = async value => {
    if(!value){setMessage("Enter a value to search.");return;}
    for(let i=0;i<items.length;i++){
      setHighlight(i); setMessage(`Searching node ${i+1}: checking ${items[i]}...`);
      await sleep(Math.max(100,800-speed*60));
      if(items[i]===value){
        setMessage(`Found ${value} at position ${i+1}.`);
        record("Search",value,`Found at ${i+1}`); setRunning(false); return;
      }
    }
    setHighlight(null); setMessage(`${value} was not found.`);
    record("Search",value,"Not found");
  };

  const clear=()=>{setItems([]);setHighlight(null);setMessage(`${structure} cleared.`);setHistory([])};

  const reset=()=>{setItems(structure==="Stack"?["40","30","20"]:structure==="Queue"?["10","20","30"]:["10","20","30","40"]);setHighlight(null);setMessage("Structure reset.");setHistory([])};

  return <div className="min-h-screen overflow-x-hidden bg-[#050507] text-white">
    <div className="pointer-events-none fixed inset-0 opacity-40" style={{background:"radial-gradient(circle at 15% 10%,rgba(99,102,241,.18),transparent 30%),radial-gradient(circle at 85% 20%,rgba(34,211,238,.10),transparent 28%)"}}/>
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#" className="flex items-center gap-3 text-xl font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500">D</span>DSA Lab</a>
        <div className="hidden gap-7 text-sm text-white/60 md:flex"><a href="#playground" className="hover:text-white">Playground</a><a href="#operations" className="hover:text-white">Operations</a><a href="#learn" className="hover:text-white">Learn</a></div>
        <span className="text-xs text-white/40">Stack · Queue · Linked List</span>
      </div>
    </nav>

    <main className="relative mx-auto max-w-7xl px-5">
      <section className="grid min-h-[58vh] items-center gap-12 py-20 lg:grid-cols-2">
        <motion.div initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.7}}>
          <div className="mb-5 text-xs font-semibold uppercase tracking-[.25em] text-yellow-300">Interactive Data Structures</div>
          <h1 className="text-5xl font-black leading-[.95] tracking-tight md:text-7xl">Understand DSA<br/><span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent">by doing.</span></h1>
          <p className="mt-7 max-w-xl text-lg text-white/55">Operate real Stack, Queue and Linked List structures and watch every insertion, deletion, search and traversal step.</p>
          <a href="#playground" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black">Open playground <ArrowRight size={18}/></a>
        </motion.div>
        <div className="rounded-3xl border border-white/10 bg-white/[.035] p-6">
          <div className="mb-6 flex items-center justify-between"><div><div className="font-semibold">{structure}</div><div className="mt-1 text-xs text-white/40">{meta.subtitle}</div></div><Icon className="text-yellow-300"/></div>
          <div className="flex h-56 items-center justify-center gap-3">
            {items.slice(-5).map((v,i)=><motion.div key={i} layout className="grid h-16 w-20 place-items-center rounded-xl border border-yellow-400/30 bg-yellow-500/10 font-bold" animate={{y:highlight===i?-8:0}}>{v}</motion.div>)}
          </div>
        </div>
      </section>

      <section id="playground" className="scroll-mt-24 py-8">
        <div className="mb-6"><div className="text-sm font-semibold text-amber-300">LIVE PLAYGROUND</div><h2 className="mt-2 text-3xl font-bold md:text-4xl">Data Structure Simulator</h2></div>
        <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5 shadow-2xl md:p-7">
          <div className="mb-6 flex flex-wrap gap-2">
            {Object.keys(STRUCTURES).map(name=><button key={name} onClick={()=>changeStructure(name)} className={"rounded-xl px-5 py-3 text-sm font-semibold transition "+(structure===name?"bg-yellow-300 text-black":"border border-white/10 bg-white/5 text-white/70 hover:bg-white/10")}>{name}</button>)}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div><div className="font-semibold">{structure}</div><div className="text-xs text-white/40">{meta.description}</div></div>
                <div className="flex gap-2"><button onClick={reset} className="rounded-xl border border-white/10 p-3 hover:bg-white/10"><RotateCcw size={17}/></button><button onClick={clear} className="rounded-xl border border-white/10 p-3 hover:bg-white/10"><Trash2 size={17}/></button></div>
              </div>
              <div className={"min-h-[390px] rounded-2xl border border-white/10 bg-[#080a12] p-6 "+(structure==="Linked List"?"":"flex items-center justify-center")}>
                {items.length===0 ? <div className="text-center text-white/30"><CircleHelp className="mx-auto mb-3"/>{structure} is empty</div> :
                structure==="Stack" ? <div className="mx-auto flex w-64 flex-col-reverse gap-2">{items.map((v,i)=><motion.div layout key={i} className={"flex h-14 items-center justify-between rounded-xl border px-5 "+(highlight===i?"border-yellow-300 bg-yellow-300/10":"border-white/10 bg-white/5")}><span className="text-xs text-white/30">{i===items.length-1?"TOP":" "+(i+1)}</span><b>{v}</b><span className="text-xs text-white/30">{i===items.length-1?"←":" "}</span></motion.div>)}</div> :
                structure==="Queue" ? <div className="w-full"><div className="mb-4 flex justify-between text-xs text-white/35"><span>FRONT</span><span>REAR</span></div><div className="flex flex-wrap items-center gap-2">{items.map((v,i)=><React.Fragment key={i}><motion.div layout className={"grid h-16 min-w-20 place-items-center rounded-xl border px-4 "+(highlight===i?"border-yellow-300 bg-yellow-300/10":"border-white/10 bg-white/5")}><b>{v}</b></motion.div>{i<items.length-1&&<ArrowRight size={16} className="text-white/20"/>}</React.Fragment>)}</div></div> :
                <div className="w-full overflow-x-auto"><div className="flex min-w-max items-center justify-center py-20">{items.map((v,i)=><React.Fragment key={i}><motion.div layout className={"relative grid h-20 w-24 place-items-center rounded-xl border "+(highlight===i?"border-yellow-300 bg-yellow-300/10":"border-white/10 bg-white/5")}><span className="font-bold">{v}</span><span className="absolute -top-7 text-[10px] text-white/30">{i===0?"HEAD":i===items.length-1?"TAIL":"NODE"}</span></motion.div>{i<items.length-1&&<div className="flex w-14 items-center justify-center"><ArrowRight className="text-amber-300"/><span className="text-[9px] text-white/25">next</span></div>}</React.Fragment>)}</div></div>}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center gap-2 text-sm"><Zap size={16} className="text-yellow-300"/> {message}</div></div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="mb-4 text-sm font-semibold">Controls</div>
                <label className="mb-3 block"><span className="mb-2 block text-xs text-white/40">{structure==="Linked List"?"Value (delete/search or insert)":"Value"}</span><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&execute(meta.operations[0])} placeholder="e.g. 50" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-indigo-400"/></label>
                <div className="grid gap-2">{meta.operations.map(op=><button disabled={running} key={op} onClick={()=>execute(op)} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 disabled:opacity-40"><span>{op}</span><Plus size={15}/></button>)}</div>
                <div className="mt-5"><div className="mb-2 flex justify-between text-xs text-white/40">Animation speed <b>{speed}</b></div><input type="range" min="1" max="10" value={speed} onChange={e=>setSpeed(Number(e.target.value))} className="w-full accent-yellow-400"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">{[["Size",items.length],["Last op",history[0]?.op||"—"],["Top/Front",items[0]||"—"],["Time",meta.time[meta.operations[0]]]].map(([a,b])=><div key={a} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-[11px] text-white/35">{a}</div><div className="mt-2 font-bold">{b}</div></div>)}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Clock3 size={16} className="text-amber-300"/> Operation history</div><div className="mt-3 space-y-2">{history.length?history.map((h,i)=><div key={i} className="flex justify-between rounded-lg bg-white/5 px-3 py-2 text-xs"><span>{h.op} <b>{h.value}</b></span><span className="text-white/35">{h.result}</span></div>):<span className="text-xs text-white/30">No operations yet.</span>}</div></div>
            </aside>
          </div>
        </div>
      </section>

      <section id="operations" className="scroll-mt-20 py-24">
        <div className="mb-10"><div className="text-sm font-semibold text-yellow-300">CORE OPERATIONS</div><h2 className="mt-2 text-3xl font-bold md:text-4xl">See the rules in action.</h2></div>
        <div className="grid gap-4 md:grid-cols-3">{Object.entries(STRUCTURES).map(([name,m])=><div key={name} className="rounded-2xl border border-white/10 bg-white/[.035] p-6"><m.icon className="text-amber-300"/><h3 className="mt-4 text-xl font-bold">{name}</h3><p className="mt-2 text-sm leading-6 text-white/45">{m.description}</p><div className="mt-5 space-y-2">{m.operations.map(o=><div key={o} className="flex justify-between rounded-lg bg-black/20 px-3 py-2 text-xs"><span>{o}</span><span className="text-yellow-300">{m.time[o]}</span></div>)}</div></div>)}</div>
      </section>

      <section id="learn" className="py-16"><div className="rounded-3xl border border-white/10 bg-white/[.035] p-7 md:p-10"><div className="flex items-center gap-3"><Search className="text-yellow-300"/><h2 className="text-2xl font-bold">What you'll learn</h2></div><div className="mt-8 grid gap-4 md:grid-cols-4">{["LIFO vs FIFO","Pointers & nodes","Insertion & deletion","Complexity analysis"].map((x,i)=><div key={x} className="rounded-2xl bg-black/20 p-5"><div className="text-xs text-amber-300">0{i+1}</div><div className="mt-3 font-semibold">{x}</div></div>)}</div></div></section>
    </main>
    <footer className="mt-20 border-t border-white/10"><div className="mx-auto flex max-w-7xl justify-between px-5 py-10 text-sm text-white/40"><span>© 2026 DSA Structures Lab</span><span>React · Tailwind CSS · Framer Motion</span></div></footer>
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);
