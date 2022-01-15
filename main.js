const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PLAYER'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $(".playlist")


const app = {
    currentIdx : 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
        name: "3107 - 3",
        singer: "W/n Dương, Nâu",
        path: "./musics/31073-WnDuonggNauTitie-7058449.mp3",
        image: "./imgs/31073.jpg",
        },
        {
        name: "Đơn giản anh yêu em",
        singer: "Hồ Quốc Việt",
        path: "./musics/Don-Gian-Anh-Yeu-Em-Ho-Quoc-Viet.mp3",
        image: "./imgs/dgaye.jpg",
        },
        {
        name: "Già cùng nhau là được",
        singer: "Tea PC",
        path: "./musics/GiaCungNhauLaDuoc-TeaPC-5743181.mp3",
        image: "./imgs/gcnld.jpg",
        },
        {
            name: 'Đoạn tuyệt nàng đi',
            singer: 'Phát Huy TK ProX',
            path: "./musics/DoanTuyetNangDiLofiVersion-PhatHuyT4KProx-7011827.mp3",
            image: "./imgs/doantuyetnangdi.jpg"
        }
    ],
    setConfig: function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render() {
        var curentIndex = this.currentIdx
        const html = this.songs.map(function (song,index) {
            return `
                    <div data-index="${index}" class="song ${index === curentIndex ? 'active' : ''}">
                        <div class="thumb" style="background-image: url('${song.image}')">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                </div>
            `
        });

        playList.innerHTML = html.join("");
        
    },

    defineProperties(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIdx]
            }
        })
    },

    handleEvent: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth

        // Xử lí CD quay
        const cdThumnAnimate = cdThumb.animate([
            {transform:'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity,
        })

        cdThumnAnimate.pause()

        // xử lí phóng to/ thu nhỏ cd
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newWidth = cdWidth-scrollTop    

            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0
            cd.style.opacity = newWidth / cdWidth
        };

        // Xử lí khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying){    
                audio.pause()
            }
            else{
                audio.play()
            }
        }

        // Khi bài hát được play 
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumnAnimate.play()
        }
        // Khi bài hát pause
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumnAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if (audio.duration){
                const progressPcent = Math.floor((audio.currentTime / audio.duration *100))
                progress.value = progressPcent
            }
        }
        
        // Xử lí khi tua
        progress.onchange = function(e){
            var seekTime = e.target.value * audio.duration /100
            console.log(seekTime)
            audio.currentTime =  seekTime
        }



        // Khi next bài hát 
        nextBtn.onclick = function(){
            if (_this.isRandom){
                _this.playRandomSong()
            }
            else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev bài hát 
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }
            else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lí random bật tắt
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lí phát lại bài hát
        repeatBtn.onclick = function(e){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lí next song khi audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }
            else{
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlisst
        playList.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
                // Xử lí khi click vào song
                if(songNode){
                    _this.currentIdx = Number(songNode.dataset.index)
                    _this.render()
                    _this.loadCurrentSong()
                    audio.play()
                }
            }
        }
    },

    loadCurrentSong: function () {
        
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

    },

    nextSong: function () {
        this.currentIdx++
        if (this.currentIdx >= this.songs.length){
            this.currentIdx = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIdx--
        if (this.currentIdx < 0){
            this.currentIdx = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function () {
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(this.currentIdx === newIndex)

        this.currentIdx = newIndex
        this.loadCurrentSong()
    },
    scrollToActiveSong(){
        setTimeout(function(){
            $('.song.active').scrollIntoView({
                behavior : 'smooth',
                block: this.curentIndex !== 0 ? 'nearest' :'center'
            })
        },300)
    },

    loadConfig(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    start() {
        // Gắn cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa thuộc tính cho Object
        this.defineProperties()
        
        // Xử lí sự kiện 
        this.handleEvent();

        // Tải thông tin bài hát đầu tiên
        this.loadCurrentSong()

        // Render danh sách bài hát
        this.render();

        // Hiển thị trạng thái ban đầu của repat và random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    },
};

app.start();
