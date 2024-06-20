const jsAssets = import.meta.globEager('@/assets/js/**/*.js');
const jsLoader = {};

export default Object.entries(jsAssets).map((path,i) => {
    let name = path[0].split("/").pop().replace('.js','');
    return [name,path[1].default];
}).reduce((acc,cur)=>{
    if(typeof cur[1] != "undefined"){
        acc[cur[0]] = cur[1];
    }
    return acc;
}, {});
