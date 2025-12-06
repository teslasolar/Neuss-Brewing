// Recipes API - Recipe Management
import {API} from './template.js';
const store={
  RCP001:{id:'RCP001',nm:'West Coast IPA',style:'American IPA',vol:400,og:1.065,fg:1.010,abv:6.8,ibu:65,
    grain:[{nm:'Pale 2-Row',kg:45,pct:85},{nm:'Crystal 40',kg:4,pct:7.5},{nm:'Munich',kg:4,pct:7.5}],
    hops:[{nm:'Warrior',g:50,t:60},{nm:'Centennial',g:80,t:30},{nm:'Cascade',g:100,t:15},{nm:'Citra',g:150,t:0}],
    yeast:{nm:'US-05',tmp:18,days:14},
    phases:[{nm:'Strike',tmp:74,dur:15},{nm:'Mash',tmp:67,dur:60},{nm:'Boil',tmp:100,dur:60},{nm:'Ferm',tmp:18,dur:20160}]},
  RCP002:{id:'RCP002',nm:'Oatmeal Stout',style:'Stout',vol:400,og:1.058,fg:1.014,abv:5.8,ibu:35,
    grain:[{nm:'Pale',kg:35,pct:70},{nm:'Oats',kg:5,pct:10},{nm:'Choc',kg:3,pct:6},{nm:'Roast',kg:2.5,pct:5}],
    hops:[{nm:'EKG',g:80,t:60},{nm:'Fuggle',g:60,t:15}],
    yeast:{nm:'S-04',tmp:20,days:21},
    phases:[{nm:'Strike',tmp:72,dur:15},{nm:'Mash',tmp:68,dur:60},{nm:'Boil',tmp:100,dur:60},{nm:'Ferm',tmp:20,dur:30240}]},
  RCP003:{id:'RCP003',nm:'Pilsner',style:'German Pils',vol:400,og:1.048,fg:1.008,abv:5.2,ibu:38,
    grain:[{nm:'Pils Malt',kg:40,pct:95},{nm:'Carapils',kg:2,pct:5}],
    hops:[{nm:'Magnum',g:40,t:60},{nm:'Saaz',g:100,t:15},{nm:'Saaz',g:80,t:0}],
    yeast:{nm:'W-34/70',tmp:10,days:28},
    phases:[{nm:'Strike',tmp:65,dur:15},{nm:'Mash',tmp:63,dur:45},{nm:'Boil',tmp:100,dur:90},{nm:'Ferm',tmp:10,dur:40320}]},
  RCP004:{id:'RCP004',nm:'Belgian Wit',style:'Witbier',vol:400,og:1.045,fg:1.008,abv:4.5,ibu:15,
    grain:[{nm:'Wheat',kg:20,pct:50},{nm:'Pils',kg:18,pct:45},{nm:'Oats',kg:2,pct:5}],
    hops:[{nm:'Saaz',g:30,t:60}],
    yeast:{nm:'WB-06',tmp:22,days:10},
    phases:[{nm:'Strike',tmp:70,dur:15},{nm:'Mash',tmp:65,dur:60},{nm:'Boil',tmp:100,dur:60},{nm:'Ferm',tmp:22,dur:14400}]}
};
export const RecipesAPI={
  ...API.crud('recipes',store),
  // Get by style
  byStyle:(s)=>API.res(true,Object.values(store).filter(r=>r.style.includes(s))),
  // Clone recipe
  clone:(id,newName)=>{
    if(!store[id])return API.res(false,null,'Recipe not found');
    const newId='RCP'+Date.now().toString(36).toUpperCase();
    store[newId]={...JSON.parse(JSON.stringify(store[id])),id:newId,nm:newName||store[id].nm+' (Copy)'};
    return API.res(true,store[newId]);
  },
  // Calculate IBU
  calcIBU:(hops,og)=>{
    const ibu=hops.reduce((sum,h)=>{
      const util=1.65*Math.pow(0.000125,og-1)*(1-Math.exp(-0.04*h.t))/4.15;
      return sum+(h.g*h.aa||10)*util*10/400;
    },0);
    return API.res(true,{ibu:Math.round(ibu)});
  }
};
export default RecipesAPI;
