export function nanoid(size = 8){const c='abcdefghijklmnopqrstuvwxyz0123456789';let id='';for(let i=0;i<size;i++) id+=c[Math.floor(Math.random()*c.length)];return id}
