document.addEventListener("DOMContentLoaded", () => {
    const CONFIG = {
        dataFile: './data.json',
        titleDuration: 12000,
        titleMusicPath: 'public/music/title.mp3'
    };

    let state = {
        bookData: null,
        pageFlip: null,
        audioPlaying: false,
        musicMap: [] // Stores the music path for every single page index
    };

    const dom = {
        overlay: document.getElementById('cinematic-overlay'),
        startScreen: document.getElementById('start-screen'),
        beginBtn: document.getElementById('begin-btn'),
        titleSequence: document.getElementById('title-sequence'),
        movieTitleText: document.getElementById('movie-title-text'),
        readerApp: document.getElementById('reader-app'),
        bookEl: document.getElementById('book'),
        bgMusic: document.getElementById('bg-music'),
        titleMusic: document.getElementById('title-music'),
        nextBtn: document.getElementById('next-btn'),
        prevBtn: document.getElementById('prev-btn'),
        musicToggle: document.getElementById('music-toggle-btn')
    };

    async function init() {
        try {
            const res = await fetch(CONFIG.dataFile);
            state.bookData = await res.json();
            
            dom.beginBtn.addEventListener('click', startCinematicIntro);
            dom.musicToggle.addEventListener('click', toggleAudio);
        } catch (e) { console.error("Data Load Error", e); }
    }

    // === TYPING EFFECT ===
    function typeWriter(text, element, speed = 250) {
        element.innerHTML = ""; 
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    function startCinematicIntro() {
        dom.startScreen.classList.add('hidden');
        dom.titleSequence.classList.remove('hidden');
        dom.titleMusic.src = CONFIG.titleMusicPath;
        dom.titleMusic.volume = 0.5;
        dom.titleMusic.play().catch(e => {});

        const title = state.bookData.root.bookTitle;
        setTimeout(()=>{
            typeWriter(title, dom.movieTitleText, 150); 
        },1000)

        setTimeout(() => {
            dom.overlay.classList.add('opacity-0');
            buildBookDOM();
            setTimeout(() => {
                dom.overlay.remove();
                dom.readerApp.classList.remove('opacity-0');
                state.audioPlaying = true;
                
                // Stop Title Music and Start Book Logic
                fadeOutIntro();
                
                // Trigger audio check for the first page (Cover)
                updatePageAudio(0);
            }, 1000);
        }, CONFIG.titleDuration);
    }

    function buildBookDOM() {
        const bookData = state.bookData.root;
        const chapters = bookData.chapters.slice(10);
        let htmlPages = [];
        
        // Reset Music Map
        state.musicMap = [];

        // Helper to push Page + Audio
        function addPage(html, musicPath = null) {
            htmlPages.push(html);
            state.musicMap.push(musicPath);
        }

        // 1. FRONT COVER (Index 0)
        addPage(`
            <div class="my-page --hard flex flex-col items-center justify-center p-10 pt-5 text-center">
                <div class="text-6xl text-love-gold mb-4 drop-shadow-lg mt-44">❦</div>
                <h1 class="font-script text-6xl mb-4 text-love-cream drop-shadow-md">${bookData.bookTitle}</h1>
                <p class="font-sans text-sm uppercase tracking-widest text-love-gold/80">Most Eligible Love</p>
            </div>
        `, null); // No music on cover (or add a specific cover theme)

        // 2. INNER LEFT (Index 1)
        addPage(`
            <div class="my-page --simple flex items-center justify-center bg-paper-darker border-r border-stone-800">
                <p class="font-serif italic text-stone-600 text-sm"></p>
            </div>
        `, null);

        // 3. INNER RIGHT / DEDICATION (Index 2)
        addPage(`
             <div class="my-page --simple flex flex-col items-center justify-center bg-paper-dark p-4 pt-10 text-xs">

                <center>

                    <p class="text-2xl text-red-600 font-script mb-2">Hi Bujji,</p>

                    <p>

                    Mana journey Instagram message tho start ayindi ani anukovachu.<br/>

                    Adi <strong>neeki mathrame</strong>.

                    </p>

                    <p>

                    Kani <strong>naaki</strong><br/>

                    mathrame ee journey chala mundu start ayindi.<br/>

                    Nenu 10 years unna time lo ne<br/>

                    oka feeling start ayindi.<br/>

                    Aa feeling ki peru appudu teliyaledu…<br/>

                    kani aa feeling ee roju<br/>

                    <strong>nee daggara ki nannu teesukochindi</strong>.

                    </p>

                    <p>

                    Aa moment nunchi,<br/>

                    naa life lo jarigina prathi change,<br/>

                    prathi turn,<br/>

                    prathi hope…<br/>

                    anni ninnu touch chesi vachinave.

                    </p>

                    <p>

                    Anduke ee book raasanu.<br/>

                    Story cheppadaniki kaadu…<br/>

                    <strong>naa journey neetho share cheskodaniki</strong>.

                    </p>

                    <p>

                    Idi nee birthday kosam kaadu.<br/>

                    Idi <strong>nee kosam</strong>.<br/>

                    Naa heart lo unna feelings ni<br/>

                    ee pages lo petti<br/>

                    neeku gift ga ivvadam kosam.

                    </p>

                    <p>

                    I love you.<br/>

                    Always. Forever.

                    </p>

                    <h1 class="text-pink-600 font-script text-6xl mb-4 mt-10 text-love-cream drop-shadow-md">

                    Happy Birthday Maaa<br/>

                    </h1>

                    <p ml-20>- Kanna</p>

                </center>

             </div>
        `, null);

        // --- CHAPTER LOOP ---
        chapters.forEach((chapter, cIdx) => {

            // A. CHAPTER SEPARATOR (Left)
            addPage(`
                <div class="my-page --simple p-12 flex flex-col justify-center text-center bg-paper-darker border-r border-stone-800">
                    <h2 class="font-script text-5xl text-love-gold mb-2 mt-44">Chapter ${chapter.chapterId}</h2>
                    <h3 class="font-serif text-2xl text-stone-400">${chapter.chapterTitle}</h3>
                </div>
            `, null);

            // B. CHAPTER SEPARATOR (Right)
            addPage(`
                 <div class="my-page --simple flex items-center justify-center bg-paper-dark"></div>
            `, null);

            // B. STORY PAGES LOOP
            chapter.pages.forEach((page, pIdx) => {
                
                // Get Music for this page pair
                const pageMusic = page.music || null;

                // 1. LEFT SIDE: CONTENT
                const formattedText = page.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-love-gold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="text-love-light">$1</em>')
                    .replace(/\n\n/g, '<br><br>');

                addPage(`
                    <div class="my-page --simple p-6 md:p-10 relative bg-paper-dark border-r border-stone-800">
                        <div class="h-full w-full overflow-y-auto custom-scrollbar pr-2 flex flex-col">
                            <span class="font-sans text-xs text-stone-600 mb-4 block">Pg ${pIdx + 1}</span>
                            <div class="font-serif text-sm md:text-base leading-relaxed text-stone-300 text-justify">
                                ${formattedText}
                            </div>
                            <div class="mt-8 text-center text-lg text-love-deep opacity-50 pb-4">❦</div>
                        </div>
                    </div>
                `, pageMusic); // <--- ASSIGN MUSIC HERE

                // 2. RIGHT SIDE: IMAGE
                if (page.image) {
                    addPage(`
                        <div class="my-page --simple p-4 md:p-6 flex flex-col items-center justify-center h-full bg-paper-darker">
                            <div class="relative shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500 bg-stone-800 p-3 pb-8 mt-20 border border-stone-700">
                                <img src="${page.image}" class="max-h-[500px] object-cover brightness-90 contrast-110 mt-10" loading="lazy">
                                <div class="font-script text-stone-500 text-xl absolute bottom-2 right-4">Memory</div>
                            </div>
                        </div>
                    `, pageMusic); // <--- ASSIGN SAME MUSIC HERE (so looking at image plays it too)
                } else {
                    addPage(`
                        <div class="my-page --simple flex items-center justify-center bg-paper-darker">
                            <span class="opacity-5 text-6xl text-stone-700">♥</span>
                        </div>
                    `, pageMusic);
                }
            });
        });

        // 4. BACK COVER
        addPage(`<div class="my-page --simple bg-paper-darker"></div>`, null);
        addPage(`
            <div class="my-page --hard flex items-center justify-center">
                <span class="font-script text-love-gold text-3xl drop-shadow-md">Fin.</span>
            </div>
        `, null);

        dom.bookEl.innerHTML = htmlPages.join('');
        initPageFlip();
    }

    function initPageFlip() {
        if (state.pageFlip) state.pageFlip.destroy();
        const isMobile = window.innerWidth < 768;
        const width = isMobile ? window.innerWidth * 0.9 : 550;
        const height = isMobile ? window.innerHeight * 0.6 : 733;

        state.pageFlip = new St.PageFlip(dom.bookEl, {
            width: width, height: height, size: isMobile ? 'stretch' : 'fixed',
            minWidth: 300, maxWidth: 1000, minHeight: 400, maxHeight: 1200,
            showCover: true, maxShadowOpacity: 0.8, mobileScrollSupport: false
        });

        state.pageFlip.loadFromHTML(document.querySelectorAll('.my-page'));

        // --- BIND EVENTS ---
        dom.nextBtn.addEventListener('click', () => state.pageFlip.flipNext());
        dom.prevBtn.addEventListener('click', () => state.pageFlip.flipPrev());
        
        // LISTEN FOR PAGE FLIP
        state.pageFlip.on('flip', (e) => {
            // e.data contains the index of the current specific page
            const currentPageIndex = e.data;
            updatePageAudio(currentPageIndex);
        });
    }

    // === NEW: AUDIO CONTROLLER ===
    function updatePageAudio(pageIndex) {
        if (!state.audioPlaying) return;

        // Get the music assigned to this page from our map
        const newMusicSrc = state.musicMap[pageIndex];

        // 1. If no music is assigned (null), pause the player
        if (!newMusicSrc) {
            dom.bgMusic.pause();
            dom.musicToggle.style.opacity = 0.5;
            return;
        }

        // 2. Get current playing source (relative or absolute)
        // We decodeURIComponent because browsers might encode spaces/special chars
        const currentFullSrc = decodeURIComponent(dom.bgMusic.currentSrc); 
        const isSameSong = currentFullSrc.includes(newMusicSrc);

        // 3. If it's a new song, play it. If it's the same song, do nothing (keep playing).
        if (!isSameSong) {
            dom.bgMusic.src = newMusicSrc;
            dom.bgMusic.volume = 0.4;
            dom.bgMusic.play().catch(e => console.log("Playback error", e));
            dom.musicToggle.style.opacity = 1;
        } else {
             // Just ensure it's playing if it was paused
             if(dom.bgMusic.paused) dom.bgMusic.play();
             dom.musicToggle.style.opacity = 1;
        }
    }

    function fadeOutIntro() {
        const fade = setInterval(() => {
            if (dom.titleMusic.volume > 0.05) dom.titleMusic.volume -= 0.05;
            else {
                clearInterval(fade); 
                dom.titleMusic.pause();
            }
        }, 200);
    }

    function toggleAudio() {
        if (dom.bgMusic.paused) {
            dom.bgMusic.play(); 
            state.audioPlaying = true;
            dom.musicToggle.style.opacity = 1;
        } else {
            dom.bgMusic.pause(); 
            state.audioPlaying = false;
            dom.musicToggle.style.opacity = 0.5;
        }
    }

    init();
});