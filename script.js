const fallbackGallery=[
  {file:'photo_15.webp',thumb:'photo_15.webp'},
  {file:'photo_01.webp',thumb:'photo_01.webp'},
  {file:'photo_32.webp',thumb:'photo_32.webp'},
  {file:'photo_28.webp',thumb:'photo_28.webp'},
  {file:'photo_29.webp',thumb:'photo_29.webp'},
  {file:'photo_02.webp',thumb:'photo_02.webp'},
  {file:'photo_13.webp',thumb:'photo_13.webp'},
  {file:'photo_14.webp',thumb:'photo_14.webp'},
  {file:'photo_30.webp',thumb:'photo_30.webp'},
  {file:'photo_16.webp',thumb:'photo_16.webp'},
  {file:'photo_26.webp',thumb:'photo_26.webp'},
  {file:'photo_24.webp',thumb:'photo_24.webp'},
  {file:'photo_25.webp',thumb:'photo_25.webp'},
  {file:'photo_27.webp',thumb:'photo_27.webp'},
  {file:'photo_17.webp',thumb:'photo_17.webp'},
  {file:'photo_18.webp',thumb:'photo_18.webp'},
  {file:'photo_06.webp',thumb:'photo_06.webp'},
  {file:'photo_09.webp',thumb:'photo_09.webp'},
  {file:'photo_10.webp',thumb:'photo_10.webp'},
  {file:'photo_22.webp',thumb:'photo_22.webp'},
  {file:'photo_04.webp',thumb:'photo_04.webp'},
  {file:'photo_21.webp',thumb:'photo_21.webp'},
  {file:'photo_11-balanced.webp',thumb:'photo_11.webp'},
  {file:'photo_12.webp',thumb:'photo_12.webp'},
  {file:'photo_19.webp',thumb:'photo_19.webp'},
  {file:'photo_20.webp',thumb:'photo_20.webp'},
  {file:'photo_07.webp',thumb:'photo_07.webp'},
  {file:'photo_03.webp',thumb:'photo_03.webp'}
];

let photos=[];
const gallery=document.getElementById('driveGallery');
const viewer=document.getElementById('photoViewer');
const viewerImage=viewer.querySelector('img');
const viewerCaption=viewer.querySelector('figcaption');
const previous=viewer.querySelector('.photoViewerPrevious');
const next=viewer.querySelector('.photoViewerNext');
let activeIndex=0;

function normalizeGallery(items){
  if(!Array.isArray(items)) return fallbackGallery;
  return items.filter(item=>item&&typeof item.file==='string').map(item=>({
    full:`assets/gallery/${item.file}`,
    thumb:`assets/thumbs/${item.thumb||item.file}`
  }));
}

function renderGallery(){
  gallery.innerHTML=photos.map((photo,index)=>`<button class="drivePhoto" type="button" data-index="${index}" aria-label="室内写真 ${index+1} を開く"><img src="${photo.thumb}" alt="テトハウス室内写真 ${index+1}" width="640" height="480" ${index<4?'':'loading="lazy"'} decoding="async"></button>`).join('');
}

function renderViewer(){
  if(!photos.length)return;
  viewerImage.src=photos[activeIndex].full;
  viewerImage.alt=`テトハウス室内写真 ${activeIndex+1}`;
  viewerCaption.textContent=`${activeIndex+1} / ${photos.length}`;
  previous.disabled=activeIndex===0;
  next.disabled=activeIndex===photos.length-1;
}
function openViewer(index){activeIndex=index;renderViewer();viewer.hidden=false;document.body.style.overflow='hidden';viewer.querySelector('.photoViewerClose').focus()}
function closeViewer(){viewer.hidden=true;document.body.style.overflow=''}

async function loadGallery(){
  try{
    const response=await fetch(`gallery.json?v=${Date.now()}`,{cache:'no-store'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    photos=normalizeGallery(await response.json());
    if(!photos.length) throw new Error('gallery.json is empty');
  }catch(error){
    console.warn('gallery.jsonの読み込みに失敗したため既定の写真一覧を使用します。',error);
    photos=normalizeGallery(fallbackGallery);
  }
  renderGallery();
}

const comparisons=[
  ['VIEW 01','窓側を見た画角','assets/gallery/photo_18.webp','assets/comparison-photo18-simulation.webp'],
  ['VIEW 02','バルコニー側から見た画角','assets/gallery/photo_11-balanced.webp','assets/comparison-photo11-simulation-balanced.webp'],
  ['VIEW 03','窓側から見た画角・明るい家具','assets/gallery/photo_06.webp','assets/simulation-photo_06-light.webp'],
  ['VIEW 04','窓側から見た画角・ダーク家具','assets/gallery/photo_06.webp','assets/simulation-photo_06-dark.webp'],
  ['VIEW 05','バルコニー側から見た画角・明るい家具','assets/gallery/photo_19.webp','assets/simulation-photo_19-light.webp'],
  ['VIEW 06','バルコニー側から見た画角・都会的な家具','assets/gallery/photo_19.webp','assets/simulation-photo_19-balanced.webp'],
  ['KITCHEN','キッチンと家電置場','assets/comparison-kitchen-actual-02.webp','assets/comparison-kitchen-simulation-02.webp']
];
document.getElementById('comparisonList').innerHTML=comparisons.map(([label,title,actual,simulation])=>`<section class="comparisonSet"><h3><span>${label}</span>${title}</h3><div class="comparisonPair"><figure><div class="comparisonBadge actualBadge">ACTUAL</div><img src="${actual}" alt="${title}の生成元となった実写"><figcaption>${label==='KITCHEN'?'実写（清掃用品のみ除去）':'シミュレーションの生成に使用した実写'}</figcaption></figure><figure><div class="comparisonBadge simulationBadge">SIMULATION</div><img src="${simulation}" alt="${title}の家具配置シミュレーション"><figcaption>左の実写を基に家具・家電・小物のみを追加</figcaption></figure></div></section>`).join('');


gallery.addEventListener('click',event=>{const button=event.target.closest('.drivePhoto');if(button)openViewer(Number(button.dataset.index))});
viewer.querySelector('.photoViewerClose').addEventListener('click',closeViewer);
previous.addEventListener('click',event=>{event.stopPropagation();if(activeIndex>0){activeIndex--;renderViewer()}});
next.addEventListener('click',event=>{event.stopPropagation();if(activeIndex<photos.length-1){activeIndex++;renderViewer()}});
viewer.querySelector('figure').addEventListener('click',event=>event.stopPropagation());
viewer.addEventListener('click',closeViewer);
addEventListener('keydown',event=>{if(viewer.hidden)return;if(event.key==='Escape')closeViewer();if(event.key==='ArrowLeft'&&activeIndex>0){activeIndex--;renderViewer()}if(event.key==='ArrowRight'&&activeIndex<photos.length-1){activeIndex++;renderViewer()}});
loadGallery();
