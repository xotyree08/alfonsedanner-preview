/* ==========================================================================
   SINGLE SOURCE OF TRUTH FOR EVERY EXTERNAL LINK ON THE SITE.
   Edit this file only — every page reads from it.

   Leave a value as an empty string ("") and the site automatically HIDES
   that link/icon instead of showing a dead one. Fill it in and it appears.
   ========================================================================== */

window.SITE_LINKS = {
  /* --- confirmed by the client --- */
  email:      "AD3mediagroup@gmail.com",
  bookAmazon: "https://www.amazon.com/dp/B0FJYCD6RL",

  /* --- TODO: client still owes us these (see README "Open items") --- */
  instagram:  "",   // e.g. https://instagram.com/AlfonseDannerRGD
  tiktok:     "",   // e.g. https://tiktok.com/@AlfonseDannerRGD
  youtube:    "",   // "Alfonse Danner | RGD Blueprint" channel URL
  facebook:   "",   // "Alfonse 'Pop' Danner" page URL
  linkedin:   "",
  linktree:   "",

  ad3Site:    "",   // AD3 Media Group site, if it gets its own
  defSite:    "",   // Danner Empowerment Foundation site
  defDonate:  "",   // donation / support page

  /* --- contact form delivery ---------------------------------------------
     Paste a form endpoint here (Formspree, Basin, Getform, Netlify, or your
     own handler) and the form posts to it over AJAX with no page reload.
     Left empty, the form falls back to opening the visitor's mail client
     with everything pre-filled and addressed to `email` above — so it still
     works on day one, just less smoothly.
     Example: "https://formspree.io/f/xxxxxxxx"
     ---------------------------------------------------------------------- */
  formEndpoint: ""
};
