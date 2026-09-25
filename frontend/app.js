const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const uploadZone = document.getElementById("uploadZone");

const processingPanel = document.getElementById("processingPanel");
const processingPercent = document.getElementById("processingPercent");
const processingStatus = document.getElementById("processingStatus");

const results = document.getElementById("results");

const originalAudio = document.getElementById("originalAudio");
const masteredAudio = document.getElementById("masteredAudio");

const originalName = document.getElementById("originalName");
const downloadButton = document.getElementById("downloadButton");

const masterButton = document.getElementById("masterButton");
const beforeButton = document.getElementById("beforeButton");
const afterButton = document.getElementById("afterButton");
const comparisonPlayer = document.getElementById("comparisonPlayer");

const cardStatus = document.querySelector(".card-status");
const cardStatusText = cardStatus
    ? cardStatus.lastChild
    : null;

let selectedPreset = "balanced";
let selectedFile = null;
let activeVersion = "before";
let isMastering = false;


/* =====================================
   CURSOR EFFECT
===================================== */

const glow = document.querySelector(".cursor-glow");

if (glow) {
    document.addEventListener("mousemove", (event) => {

        glow.animate(
            {
                left: `${event.clientX}px`,
                top: `${event.clientY}px`
            },
            {
                duration: 700,
                fill: "forwards"
            }
        );

    });
}


/* =====================================
   ROTATING SECTION TITLE
===================================== */

const rotatingTitle = document.getElementById("rotatingTitle");

const titleWords = [
    "YOUR TRACK.",
    "YOUR SOUND.",
    "YOUR MASTER.",
    "YOUR MOMENT."
];

let titleIndex = 0;

if (rotatingTitle) {

    setInterval(() => {

        rotatingTitle.classList.add("title-changing");

        setTimeout(() => {

            titleIndex =
                (titleIndex + 1) % titleWords.length;

            rotatingTitle.textContent =
                titleWords[titleIndex];

            rotatingTitle.classList.remove("title-changing");

        }, 350);

    }, 3000);

}


/* =====================================
   PRESETS
===================================== */

const presetButtons =
    document.querySelectorAll(".preset");

presetButtons.forEach((button) => {

    button.addEventListener("click", () => {

        if (!selectedFile || isMastering) {
            return;
        }

        presetButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        selectedPreset =
            button.dataset.preset;

    });

});


/* =====================================
   INITIAL PRESET STATE
===================================== */

presetButtons.forEach(button => {
    button.disabled = true;
});


if (masterButton) {
    masterButton.disabled = true;
}


/* =====================================
   UPLOAD BUTTON
===================================== */

uploadButton.addEventListener("click", () => {

    if (isMastering) {
        return;
    }

    fileInput.click();

});


/* =====================================
   FILE SELECTED
===================================== */

fileInput.addEventListener("change", () => {

    if (fileInput.files.length > 0) {

        prepareFile(fileInput.files[0]);

    }

});


/* =====================================
   DRAG & DROP
===================================== */

uploadZone.addEventListener("dragover", (event) => {

    event.preventDefault();

    if (!isMastering) {
        uploadZone.classList.add("dragging");
    }

});


uploadZone.addEventListener("dragleave", () => {

    uploadZone.classList.remove("dragging");

});


uploadZone.addEventListener("drop", (event) => {

    event.preventDefault();

    uploadZone.classList.remove("dragging");

    if (isMastering) {
        return;
    }

    const file =
        event.dataTransfer.files[0];

    if (file) {
        prepareFile(file);
    }

});


/* =====================================
   PREPARE FILE
   DOES NOT MASTER
===================================== */

function prepareFile(file) {

    const allowedTypes = [
        "audio/wav",
        "audio/x-wav",
        "audio/mpeg",
        "audio/flac",
        "audio/ogg",
        "audio/mp4"
    ];

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    const allowedExtensions = [
        "wav",
        "mp3",
        "flac",
        "ogg",
        "m4a"
    ];

    if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(extension)
    ) {

        alert(
            "Please upload WAV, MP3, FLAC, OGG or M4A."
        );

        return;

    }


    selectedFile = file;


    /* =================================
       ORIGINAL PREVIEW
    ================================= */

    const localUrl =
        URL.createObjectURL(file);

    originalAudio.src = localUrl;

    originalAudio.load();

    originalName.textContent =
        file.name;


    /* =================================
       ENABLE PRESETS
    ================================= */

    presetButtons.forEach(button => {
        button.disabled = false;
    });


    if (masterButton) {
        masterButton.disabled = false;
    }


    /* =================================
       UPDATE UPLOAD CARD
    ================================= */

    if (cardStatus) {

        cardStatus.classList.add("file-ready");

        if (cardStatusText) {
            cardStatusText.textContent = "TRACK READY";
        }

    }


    /* =================================
       RESET PROCESSING
    ================================= */

    processingPercent.textContent = "00";

    processingStatus.textContent = "READY";

    processingPanel.classList.remove(
        "is-processing"
    );


    /* =================================
       RESET RESULTS
    ================================= */

    results.classList.remove("show");

    masteredAudio.removeAttribute("src");

    masteredAudio.load();


    /* =================================
       RESET COMPARISON
    ================================= */

    activeVersion = "before";

    updateComparisonUI();


    /* =================================
       SCROLL TO MASTERING
    ================================= */

    document
        .getElementById("mastering")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* =====================================
   MASTER BUTTON
===================================== */

if (masterButton) {

    masterButton.addEventListener(
        "click",
        startMastering
    );

}


/* =====================================
   START MASTERING
===================================== */

async function startMastering() {

    if (!selectedFile) {

        alert(
            "Please upload a track first."
        );

        return;

    }


    if (isMastering) {
        return;
    }


    isMastering = true;


    /* =================================
       DISABLE UI
    ================================= */

    masterButton.disabled = true;

    presetButtons.forEach(button => {
        button.disabled = true;
    });

    uploadButton.disabled = true;


    /* =================================
       HIDE OLD RESULTS
    ================================= */

    results.classList.remove("show");


    /* =================================
       ACTIVATE PROCESSING ANIMATION
    ================================= */

    processingPanel.classList.add(
        "is-processing"
    );

    processingStatus.textContent =
        "ANALYZING";

    processingPercent.textContent =
        "00";


    processingPanel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    /* =================================
       FAKE VISUAL PROGRESS
    ================================= */

    let percent = 0;

    const progress =
        setInterval(() => {

            percent +=
                Math.random() * 7;

            if (percent > 92) {
                percent = 92;
            }

            processingPercent.textContent =
                Math.floor(percent)
                    .toString()
                    .padStart(2, "0");

        }, 180);


    try {

        const formData =
            new FormData();

        formData.append(
            "file",
            selectedFile
        );

        formData.append(
            "preset",
            selectedPreset
        );


        processingStatus.textContent =
            "MASTERING";


        const response =
            await fetch(
                "/master",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        clearInterval(progress);


        if (!data.success) {

            throw new Error(
                data.error ||
                "Mastering failed."
            );

        }


        /* =================================
           COMPLETE
        ================================= */

        processingPercent.textContent =
            "100";

        processingStatus.textContent =
            "COMPLETE";


        /* =================================
           AUDIO FILES
        ================================= */

        const originalUrl =
            data.original_url;

        const masteredUrl =
            data.mastered_url;


        originalAudio.src =
            originalUrl;

        originalAudio.load();


        masteredAudio.src =
            masteredUrl;

        masteredAudio.load();


        downloadButton.href =
            masteredUrl;


        /* =================================
           RESET COMPARISON
        ================================= */

        activeVersion = "before";

        updateComparisonUI();


        /* =================================
           STOP PROCESSING ANIMATION
        ================================= */

        processingPanel.classList.remove(
            "is-processing"
        );


        /* =================================
           SHOW RESULTS
        ================================= */

        setTimeout(() => {

            results.classList.add("show");

            results.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 700);


    } catch (error) {

        clearInterval(progress);


        processingPanel.classList.remove(
            "is-processing"
        );

        processingStatus.textContent =
            "ERROR";


        alert(
            "Mastering failed: " +
            error.message
        );

    }


    isMastering = false;


    /* =================================
       RE-ENABLE UI
    ================================= */

    presetButtons.forEach(button => {
        button.disabled = false;
    });

    uploadButton.disabled = false;

    masterButton.disabled = false;

}


/* =====================================
   BEFORE / AFTER SWITCH
===================================== */

if (beforeButton) {

    beforeButton.addEventListener(
        "click",
        () => switchVersion("before")
    );

}


if (afterButton) {

    afterButton.addEventListener(
        "click",
        () => switchVersion("after")
    );

}


function switchVersion(version) {

    if (version === activeVersion) {
        return;
    }


    const currentAudio =
        activeVersion === "before"
            ? originalAudio
            : masteredAudio;


    const nextAudio =
        version === "before"
            ? originalAudio
            : masteredAudio;


    /*
       Save exact playback position
    */

    const currentTime =
        currentAudio.currentTime;


    const wasPlaying =
        !currentAudio.paused &&
        !currentAudio.ended;


    /*
       Stop current player
    */

    currentAudio.pause();


    /*
       Switch active version
    */

    activeVersion = version;


    /*
       Move new player to EXACT
       same position
    */

    try {

        nextAudio.currentTime =
            currentTime;

    } catch (error) {

        console.log(
            "Could not sync playback position."
        );

    }


    /*
       Update visual interface
    */

    updateComparisonUI();


    /*
       Resume playback if it
       was already playing
    */

    if (wasPlaying) {

        nextAudio.play().catch(() => {
            // Browser autoplay restrictions
        });

    }

}


/* =====================================
   UPDATE COMPARISON UI
===================================== */

function updateComparisonUI() {

    if (!comparisonPlayer) {
        return;
    }


    if (activeVersion === "before") {

        comparisonPlayer.classList
            .remove("after-active");

        beforeButton.classList.add("active");

        afterButton.classList.remove("active");


    } else {

        comparisonPlayer.classList
            .add("after-active");

        beforeButton.classList.remove("active");

        afterButton.classList.add("active");

    }

}


/* =====================================
   KEEP HIDDEN PLAYER SYNCHRONIZED
===================================== */

originalAudio.addEventListener(
    "timeupdate",
    () => {

        if (activeVersion === "before") {

            if (
                Math.abs(
                    masteredAudio.currentTime -
                    originalAudio.currentTime
                ) > 0.15
            ) {

                masteredAudio.currentTime =
                    originalAudio.currentTime;

            }

        }

    }
);


masteredAudio.addEventListener(
    "timeupdate",
    () => {

        if (activeVersion === "after") {

            if (
                Math.abs(
                    originalAudio.currentTime -
                    masteredAudio.currentTime
                ) > 0.15
            ) {

                originalAudio.currentTime =
                    masteredAudio.currentTime;

            }

        }

    }
);


/* =====================================
   KEEP PLAYBACK STATE SYNCHRONIZED
===================================== */

originalAudio.addEventListener(
    "play",
    () => {

        if (
            activeVersion === "before" &&
            masteredAudio.readyState >= 2
        ) {

            masteredAudio.currentTime =
                originalAudio.currentTime;

        }

    }
);


masteredAudio.addEventListener(
    "play",
    () => {

        if (
            activeVersion === "after" &&
            originalAudio.readyState >= 2
        ) {

            originalAudio.currentTime =
                masteredAudio.currentTime;

        }

    }
);


/* =====================================
   PARTICLE BACKGROUND
===================================== */

const canvas =
    document.getElementById("particles");

const ctx =
    canvas.getContext("2d");

let particles = [];


function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;

}


resizeCanvas();


window.addEventListener(
    "resize",
    resizeCanvas
);


for (
    let i = 0;
    i < 90;
    i++
) {

    particles.push({

        x:
            Math.random() *
            window.innerWidth,

        y:
            Math.random() *
            window.innerHeight,

        size:
            Math.random() * 1.5 + .3,

        speed:
            Math.random() * .25 + .05,

        opacity:
            Math.random() * .5 + .1

    });

}


function animateParticles() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    particles.forEach(p => {

        p.y -= p.speed;


        if (p.y < 0) {

            p.y =
                canvas.height;

        }


        ctx.beginPath();


        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(167,139,250,${p.opacity})`;


        ctx.fill();

    });


    requestAnimationFrame(
        animateParticles
    );

}


animateParticles();
