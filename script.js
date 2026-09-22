const galleryNumbers=[15,1,32,28,29,2,13,14,30,16,26,24,25,27,17,18,6,9,10,22,4,21,11,12,19,20,7,3];
const photos=galleryNumbers.map(number=>({full:`assets/gallery/photo_${String(number).padStart(2,'0')}${number===11?'-balanced.webp':'.webp'}`,thumb:`assets/thumbs/photo_${String(number).padStart(2,'0')}.webp`}));
const gallery=document.getElementById('driveGallery');
gallery.innerHTML=photos.map((photo,index)=>`<button class="drivePhoto" type="button" data-index="${index}" aria-label="室内写真 ${index+1} を開く"><img src="${photo.thumb}" alt="テトハウス室内写真 ${index+1}" width="640" height="480" ${index<4?'':'loading="lazy"'} decoding="async"></button>`).join('');

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

const viewer=document.getElementById('photoViewer');
const viewerImage=viewer.querySelector('img');
const viewerCaption=viewer.querySelector('figcaption');
const previous=viewer.querySelector('.photoViewerPrevious');
const next=viewer.querySelector('.photoViewerNext');
let activeIndex=0;
function renderViewer(){viewerImage.src=photos[activeIndex].full;viewerImage.alt=`テトハウス室内写真 ${activeIndex+1}`;viewerCaption.textContent=`${activeIndex+1} / ${photos.length}`;previous.disabled=activeIndex===0;next.disabled=activeIndex===photos.length-1}
function openViewer(index){activeIndex=index;renderViewer();viewer.hidden=false;document.body.style.overflow='hidden';viewer.querySelector('.photoViewerClose').focus()}
function closeViewer(){viewer.hidden=true;document.body.style.overflow=''}
gallery.addEventListener('click',event=>{const button=event.target.closest('.drivePhoto');if(button)openViewer(Number(button.dataset.index))});
viewer.querySelector('.photoViewerClose').addEventListener('click',closeViewer);
previous.addEventListener('click',event=>{event.stopPropagation();if(activeIndex>0){activeIndex--;renderViewer()}});
next.addEventListener('click',event=>{event.stopPropagation();if(activeIndex<photos.length-1){activeIndex++;renderViewer()}});
viewer.querySelector('figure').addEventListener('click',event=>event.stopPropagation());viewer.addEventListener('click',closeViewer);
addEventListener('keydown',event=>{if(viewer.hidden)return;if(event.key==='Escape')closeViewer();if(event.key==='ArrowLeft'&&activeIndex>0){activeIndex--;renderViewer()}if(event.key==='ArrowRight'&&activeIndex<photos.length-1){activeIndex++;renderViewer()}});
