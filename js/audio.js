// 播放按钮（获取DOM元素，变量名与HTML class保持一致）
var playpause = document.getElementsByClassName('playpause')[0];
// 音频元素（变量名统一，后续直接使用该变量）
var audiotag = document.getElementById('audiotag');
// 获取必要元素
var recordImg = document.getElementById('record_img');
var body = document.body;
// 恢复：获取歌曲名称和歌手的显示容器
var music_container = document.getElementsByClassName('music_container')[0];
var author_name = document.getElementsByClassName('author_name')[0];
//获取上一首下一首
var beformusic=document.getElementsByClassName('beformusic')[0];
var nextmusic=document.getElementsByClassName('nextmusic')[0];
//获取时间
var playtheTime=document.getElementsByClassName('player_time')[0];
var totalTime=document.getElementsByClassName('audio_time')[0];
//进度条
var progressPlay=document.getElementsByClassName('progress-play')[0];
//播放模式
var playmode=document.getElementsByClassName('playMode')[0]
//音量
var volume=document.getElementsByClassName('volumn')[0]
var volumetogger=document.getElementById('volumn-togger')
// 倍速元素（新增）
var speedBtn = document.getElementById('speed');

// MV 相关 DOM（会在 ensureCreateList 中初始化）
var mvContainer = null;
var mvPlayer = null;
var mvClose = null;
var mvBtn = document.getElementById('MV');
var mvWasPlaying = false;

// 列表相关 DOM（会在 DOMContentLoaded/ensureCreateList 中重新查询）
var closeContainer = null;
var listContainer = null;
var listIcon = null;
var musiclist = null;

// 歌曲名称数组
var musics = [
    ['洛春赋', '云汐'],
    ['Yesterday', 'Alok/sofi Tukker'],
    ['江南烟雨色', '杨树人'],
    ['vision pt.II', 'vicetone']
];
// 当前播放歌曲索引
var musicId = 0;
// 倍速配置（新增）
var speedList = [0.5, 0.75, 1.0, 1.25, 1.5, 1.8, 2.0]; // 支持的倍速列表
var currentSpeedIndex = 5; // 默认1.8倍速（对应数组索引5）

// 初始化音乐
function initMusic() {
    audiotag.src = `./mp3/music${musicId}.mp3`;
    audiotag.load(); // 调用音频元素的加载方法
    // 恢复：直接给HTML元素赋值
    music_container.innerText = musics[musicId][0]; // 歌曲名
    author_name.innerText = musics[musicId][1]; // 歌手名
    // 初始化倍速（新增）
    audiotag.playbackRate = speedList[currentSpeedIndex];
    // 同步列表高亮（若列表已生成）
    if (typeof updateListActive === 'function') updateListActive();
}

//初始化并且自动播放
function iniAndPlay(){
    initMusic();
    // 等待音频加载完成后再播放，避免play()失败
    audiotag.onloadedmetadata = function() {
        recordImg.style.backgroundImage = `url('img/record${musicId}.jpg')`;
        body.style.backgroundImage = `url('img/bg${musicId}.png')`;
        refreshRotate();
        totalTime.innerText = `/ ${formateTime(audiotag.duration)}`; // 修复时间显示格式
        
        rotateRecord();
        audiotag.play();
        playpause.classList.remove('icon-play')
        playpause.classList.add('icon-pause');
    };
    audiotag.load();
    // 确保列表高亮
    if (typeof updateListActive === 'function') updateListActive();
}

// 初始化
initMusic();

// 点击播放/暂停按钮事件（有元素时才绑定）
if (playpause) {
    playpause.addEventListener('click', function() {
        if (audiotag.paused) {
            audiotag.play();
            rotateRecord();
            playpause.classList.remove('icon-play')
            playpause.classList.add('icon-pause')
        } else {
            audiotag.pause();
            rotateRecordStop();
            playpause.classList.remove('icon-pause')
            playpause.classList.add('icon-play')
        }
    });
}

// 音频加载完成事件
audiotag.onloadedmetadata = function() {
    recordImg.style.backgroundImage = `url('img/record${musicId}.jpg')`;
    body.style.backgroundImage = `url('img/bg${musicId}.png')`;
    refreshRotate();
    totalTime.innerText = `/ ${formateTime(audiotag.duration)}`; // 修复时间显示格式
};

// 唱片旋转函数
function rotateRecord() {
    recordImg.style.animationPlayState = 'running';
}
function rotateRecordStop() {
    recordImg.style.animationPlayState = 'paused';
}
function refreshRotate() {
    recordImg.classList.add('rotate-play');
}

//跳转到下一首
if (nextmusic) {
    nextmusic.addEventListener('click',function(){
        musicId++;
        if (musicId>=musics.length){
            musicId=0;
        }
        iniAndPlay();
        if (typeof updateListActive === 'function') updateListActive();
    });
}
//跳转到上一首
if (beformusic) {
    beformusic.addEventListener('click',function(){
        musicId--;
        if(musicId < 0){
            musicId = musics.length - 1;
        }
        iniAndPlay();
        if (typeof updateListActive === 'function') updateListActive();
    });
}

//时间格式化
function formateTime(value){
    if (isNaN(value)) return '00:00';
    var hour=parseInt(value/3600);
    var mins=parseInt((value%3600)/60);
    var sec=parseInt(value%60); 
    hour = hour.toString().padStart(2,'0');
    mins = mins.toString().padStart(2,'0');
    sec = sec.toString().padStart(2,'0');
    return hour>0 ? `${hour}:${mins}:${sec}` : `${mins}:${sec}`;
}

//音乐进度更新
function updateProgress(){
    if (isNaN(audiotag.duration)) return;
    playtheTime.innerText=formateTime(audiotag.currentTime); 
    var value=audiotag.currentTime/audiotag.duration;
    value = Math.max(0, Math.min(1, value));
    progressPlay.style.width=value*100+'%';
}
audiotag.addEventListener('timeupdate', updateProgress);

// ===================== 核心适配：匹配你的图标命名 =====================
// 模式状态：0=单曲，1=顺序，2=随机（对应你的mode1=单曲、mode2=顺序、mode3=随机）
var playModeStatus = 0; 
// 图标路径映射：严格按你的文件命名来
var modeIconMap = [
    'img/mode1.png',  // 0=单曲循环（对应你的mode1.png）
    'img/mode2.png',  // 1=顺序播放（对应你的mode2.png）
    'img/mode3.png'   // 2=随机播放（对应你的mode3.png）
];

// 播放模式切换：点击后循环切换「单曲→顺序→随机→单曲」
if (playmode) {
    playmode.addEventListener('click',function(){
    playModeStatus = (playModeStatus + 1) % 3;
    // 加载对应图标
    playmode.style.backgroundImage = `url('${modeIconMap[playModeStatus]}')`;
    // 调试日志（可删除）
    console.log('当前模式：', playModeStatus===0?'单曲循环':playModeStatus===1?'顺序播放':'随机播放');
    });
}

// 音乐播放完：严格按模式状态执行逻辑
audiotag.addEventListener('ended',function(){
    // 0=单曲循环（显示mode1.png，执行单曲逻辑）
    if(playModeStatus === 0){
        audiotag.currentTime = 0;
        rotateRecord();
        audiotag.play();
        playpause.classList.remove('icon-play')
        playpause.classList.add('icon-pause');
    }
    // 1=顺序播放（显示mode2.png，执行顺序逻辑）
    else if(playModeStatus === 1){
        musicId++;
        if (musicId>=musics.length) musicId=0;
        iniAndPlay();
        if (typeof updateListActive === 'function') updateListActive();
    }
    // 2=随机播放（显示mode3.png，执行随机逻辑）
    else if(playModeStatus === 2){
        var oldid=musicId;
        if(musics.length <= 1){
            audiotag.currentTime = 0;
            audiotag.play();
            rotateRecord();
            return;
        }
        while(true){
            musicId=Math.floor(Math.random()*musics.length);
            if(musicId!=oldid) break;
        }
        iniAndPlay();
        if (typeof updateListActive === 'function') updateListActive();
    }
})

// 列表面板打开/关闭逻辑
if (listIcon && listContainer && closeContainer) {
    listIcon.addEventListener('click', function() {
        listContainer.classList.remove('list-hide');
        listContainer.classList.add('list-show');
        closeContainer.style.display = 'block';
        listContainer.style.display = 'block';
    });
    closeContainer.addEventListener('click', function() {
        listContainer.classList.remove('list-show');
        listContainer.classList.add('list-hide');
        setTimeout(function() {
            closeContainer.style.display = 'none';
            listContainer.style.display = 'none';
        }, 400);
    });
}

// 生成播放列表（显示歌名与作者，支持点击跳转）
function createMusicList() {
    musiclist = document.getElementsByClassName('musiclist')[0];
    if (!musiclist) return;
    musiclist.innerHTML = '';
    for (let i = 0; i < musics.length; i++) {
        const item = document.createElement('div');
        item.className = 'music-item';
        item.dataset.index = i;
        item.innerHTML = `<div class="list-name">${musics[i][0]}</div><div class="list-author">${musics[i][1]}</div>`;
        item.addEventListener('click', function() {
            musicId = Number(this.dataset.index);
            iniAndPlay();
            // 关闭列表
            if (listContainer) {
                listContainer.classList.remove('list-show');
                listContainer.classList.add('list-hide');
            }
            setTimeout(function() {
                if (closeContainer) closeContainer.style.display = 'none';
                if (listContainer) listContainer.style.display = 'none';
            }, 300);
        });
        musiclist.appendChild(item);
    }
    updateListActive();
}

function updateListActive() {
    musiclist = document.getElementsByClassName('musiclist')[0];
    if (!musiclist) return;
    const items = musiclist.children;
    for (let i = 0; i < items.length; i++) {
        if (Number(items[i].dataset.index) === musicId) {
            items[i].classList.add('playing');
        } else {
            items[i].classList.remove('playing');
        }
    }
}

// 在脚本加载完后生成列表 —— 兼容性：如果文档已加载，则直接调用，否则监听事件
function ensureCreateList() {
    try {
        // 重新查询列表相关 DOM（script 可能在这些节点之前执行）
        closeContainer = document.getElementsByClassName('close-container')[0];
        listContainer = document.getElementsByClassName('list-container')[0];
        listIcon = document.getElementById('list');
        musiclist = document.getElementsByClassName('musiclist')[0];

        if (typeof createMusicList === 'function') createMusicList();

        // 绑定打开/关闭（如果尚未绑定）
        if (listIcon && listContainer && closeContainer) {
            listIcon.addEventListener('click', function() {
                listContainer.classList.remove('list-hide');
                listContainer.classList.add('list-show');
                closeContainer.style.display = 'block';
                listContainer.style.display = 'block';
            });
            closeContainer.addEventListener('click', function() {
                listContainer.classList.remove('list-show');
                listContainer.classList.add('list-hide');
                setTimeout(function() {
                    closeContainer.style.display = 'none';
                    listContainer.style.display = 'none';
                }, 400);
            });
        }

        // 绑定 MV 按钮与播放器（如果存在）
        mvContainer = document.getElementsByClassName('mv-container')[0];
        mvPlayer = document.getElementById('mvPlayer');
        mvClose = document.getElementsByClassName('mv-close')[0];
        // 绑定 MV 按钮（页面上的 #MV）
        if (mvBtn && mvContainer && mvPlayer) {
            mvBtn.addEventListener('click', function() {
                try {
                    // 记录当前是否在播放音频，打开 MV 时先暂停音频
                    mvWasPlaying = !audiotag.paused;
                    if (mvWasPlaying) audiotag.pause();
                    // 设置视频源（映射到 ./mp4/video{musicId}.mp4）
                    mvPlayer.src = `./mp4/video${musicId}.mp4`;
                    mvPlayer.currentTime = 0;
                    mvContainer.style.display = 'flex';
                    mvPlayer.play().catch(function(e){ console.warn('mv play error', e); });
                } catch (e) { console.error('MV open error', e); }
            });
        }
        // 关闭按钮
        if (mvClose && mvContainer && mvPlayer) {
            mvClose.addEventListener('click', function() {
                try {
                    mvPlayer.pause();
                    mvPlayer.src = '';
                    mvContainer.style.display = 'none';
                    // 恢复音频（如果之前在播放）
                    if (mvWasPlaying) {
                        audiotag.play().catch(function(){});
                    }
                } catch (e) { console.error('MV close error', e); }
            });
        }
        // 当视频播放完毕时自动关闭并恢复音频
        if (mvPlayer) {
            mvPlayer.addEventListener('ended', function() {
                if (mvContainer) mvContainer.style.display = 'none';
                mvPlayer.src = '';
                if (mvWasPlaying) audiotag.play().catch(function(){});
            });
        }
    } catch (e) {
        console.error('createMusicList error:', e);
    }
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    ensureCreateList();
} else {
    document.addEventListener('DOMContentLoaded', ensureCreateList);
}

// ===================== 音量控制（原有修复保留） =====================
var lastvolume=50;
audiotag.volume=lastvolume/100;
volumetogger.value = lastvolume;

if (volume) volume.addEventListener('click', setVolume)
function setVolume(){
    if(audiotag.muted||audiotag.volume==0){
        audiotag.muted=false;
        audiotag.volume=lastvolume/100;
        volumetogger.value=lastvolume;
    }
    else{
        audiotag.muted=true;
        lastvolume=volumetogger.value;
        volumetogger.value=0;
    }
    updatevolumeicon();
}

if (volumetogger) volumetogger.addEventListener('input',updatevolume);
function updatevolume(){
    const volumeValue=parseInt(volumetogger.value)/100;
    const finalVolume = Math.max(0, Math.min(1, volumeValue));
    audiotag.volume=finalVolume;
    if(finalVolume>0){
        audiotag.muted=false;
        lastvolume = volumetogger.value;
    }
    updatevolumeicon();
}

function updatevolumeicon(){
    if(audiotag.muted||audiotag.volume===0){
        volume.style.backgroundImage=`url('img/静音.png')`;
    }
    else{
        volume.style.backgroundImage=`url('img/音量.png')`;
    }
}
updatevolumeicon();

// ===================== 倍速功能（新增核心代码） =====================
// 初始化倍速显示与绑定（做存在性检查，避免空引用）
if (speedBtn) {
    speedBtn.innerText = speedList[currentSpeedIndex];
    speedBtn.style.cursor = 'pointer';
    speedBtn.addEventListener('click', function() {
        currentSpeedIndex = (currentSpeedIndex + 1) % speedList.length;
        audiotag.playbackRate = speedList[currentSpeedIndex];
        // 显示如 1.8X
        speedBtn.innerText = speedList[currentSpeedIndex] + 'X';
        console.log('当前播放倍速：', speedList[currentSpeedIndex]);
    });
}