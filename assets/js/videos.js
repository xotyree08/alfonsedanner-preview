/* ==========================================================================
   THE VIDEO LIST — this is the only file you edit to post a new clip.

   HOW TO ADD TODAY'S VIDEO
   ------------------------
   1. Upload the clip to YouTube (that is what the channel is for, and it costs
      us nothing to host or stream).
   2. Copy the ID out of the URL. In
         https://www.youtube.com/watch?v=dQw4w9WgXcQ
      the ID is        dQw4w9WgXcQ
      In a Shorts URL, youtube.com/shorts/dQw4w9WgXcQ, it is the same thing.
   3. Add ONE line to the top of the list below. Done.

        { youtube: "dQw4w9WgXcQ", title: "Pain Is Inevitable", date: "2026-09-11" },

   Order does not matter — the page sorts newest-first by `date` on its own.
   `blurb` is optional; add a sentence when the clip deserves one.

   If a clip is NOT on YouTube and you want to host it here instead, use `file`
   and `poster` instead of `youtube`:

        { file: "assets/video/clip-02.mp4", poster: "assets/img/clip-02.jpg",
          title: "Standards", date: "2026-09-12" },

   Hosted-here files are capped by what the server will carry, so keep them
   small — YouTube is the better home for the daily clips.
   ========================================================================== */

window.SITE_VIDEOS = [

  {
    file:   "assets/video/did-i-win.mp4",
    poster: "assets/img/video-poster.jpg",
    title:  "Did I Win? — The Trailer",
    date:   "2026-07-31",
    blurb:  "Sixty seconds on what it feels like when the verdict lands — and what happens when you refuse to accept it as final."
  }

];
