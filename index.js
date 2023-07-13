const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const playlist = $(".playlist");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");

const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const PLAYER_STORAGE_KEY = 'MUSIC_APP'
const randomBtn = $(".btn-random");

const restBtn = $(".btn-repeat");
const app = {
  currentIndex: 0,
  Isplaying: false,
  IsRandom: false,
  IsRepeat: false,
  config:JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    
    {
      name: "Lãng Du",
      singer: "Mike",
      path: "./music/langdu.mp3",
      image: "./image/icon.png",
    },
    {
      name: "Vô định",
      singer: "Mike",
      path: "./music/vodinh.mp3",
      image: "./image/vodinh.jpg",
    },
    {
      name: "Monsters",
      singer: "Mike",
      path: "./music/Monsters.mp3",
      image: "./image/k.jpg",
    },
    {
      name: "Lãng Peace",
      singer: "Mike",
      path: "./music/Peace.mp3",
      image: "./image/monster.jpg",
    },
  ],
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index == this.currentIndex ? "active" : ""
        }" data-index=${index}>
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
         
        `;
    });
    playlist.innerHTML = htmls.join("");
  },
  setConfig : function(key, value){
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))

  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const cdWidth = cd.offsetWidth;

    // xử lý quay cd
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000, // quay 10s
        iterations: Infinity,
      }
    );
    cdThumbAnimate.pause();
    // phóng to thu nhỏ
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };
    // play music
    playBtn.onclick = function () {
      if (app.Isplaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // khi nhạc bật thì
    audio.onplay = function () {
      app.Isplaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    audio.onpause = function () {
      app.Isplaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    // khi tua bài nahcj
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý tua
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };
    // console.log(audio.currentTime / audio.duration*100)

    // next bài hát
    nextBtn.onclick = function () {
      if (app.IsRandom) {
        app.randomSong();
      } else {
        app.nextSong();
      }

      audio.play();
      app.render();
    };
    prevBtn.onclick = function () {
      if (app.IsRandom) {
        app.randomSong();
      } else {
        app.prevSong();
      }

      audio.play();
      app.render();
    };
    // random nhạc
    randomBtn.onclick = function (e) {
      app.IsRandom = !app.IsRandom;
      app.setConfig('isRandom', app.IsRandom)
      randomBtn.classList.toggle("active", app.IsRandom);
      app.randomSong();
    };
    // xử láy lặp bài hát
    restBtn.onclick = function (e) {
      app.IsRepeat = !app.IsRepeat;
      app.setConfig('IsRepeat', app.IsRepeat)
      restBtn.classList.toggle("active", app.IsRepeat);
    };
    // xuwr lys next
    audio.onended = function () {
      if (app.IsRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    // lắng nghe hành vi click vào play list
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      //xử lý truyền đến bài đó

      if (songNode || e.target.closest(".option")) {
        // xư lý vào song
        if (songNode) {
          app.currentIndex = Number(songNode.dataset.index);
          app.loadCurrenSong();
         
          app.render();
           audio.play();
    
        }
        // xử lý bằng option
        if (e.target.closest(".option")) {
          console.log('alo')
        }
      }
    };
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrenSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrenSong();
  },
  randomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrenSong();
  },
  loadConfig : function(){
    this.IsRandom = this.config.IsRandom
    this.IsRepeat = this.config.IsRepeat
  },

  loadCurrenSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;

    // console.log(heading, cdThumb, audio);
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".ong.active").scrollIntoView({
        behavior: "center",
        block: "nearest",
      });
    }, 500);
  },

  start: function () {
    this.loadConfig();
    // gán cấu hình từ cấu hình ứng dụng
    // định nghĩa các thuộc tính cho object
    this.defineProperties();
    // lắng nghe/ xử lts sự kiện
    this.handleEvents();

    // tải thông tin bài hát
    this.loadCurrenSong();
    //render playlist
    this.render();
    // hiển thị trạng thái ban đầu của btn 
    randomBtn.classList.toggle("active", app.IsRandom);
    restBtn.classList.toggle("active", app.IsRepeat);
  },
};

app.start();
