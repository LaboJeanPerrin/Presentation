/* ====================================================================================== *\
                                      INIIALIZATION
\* ====================================================================================== */


// --- Preliminary DOM manipulations -------------------------------------------------------

// --- Code snippets

$('snippet').each(function () {

  // --- Get and clean the code
  var code = $(this).html();

  // html
  if ($(this).hasClass('html')) {
    code = code.replace(/ data\-brackets\-id="[0-9]*"/g, '');
    code = code.replace(/=""/g, '');
  }

  // escape
  if ($(this).hasClass('escape')) {
    code = code.replace(/&amp;/g, '&');
  }

  // Indentation
  var v = code.match(/^\s*/)[0];
  while (code.match(v)) { code = code.replace(v, "\n"); }
  code = jQuery.trim(code);

  // Replace the snippet
  var c = $('<code />').text(code);

  var rep = $("<pre></pre>").append(c);
  $(this).replaceWith(rep);

});

// --- Initialize Reveal.js ----------------------------------------------------------------

Reveal.initialize({
  slideNumber: true,
  showSlideNumber: 'speaker',
  transition: 'slide',
  history: true,
  pdfSeparateFragments: false,
  math: {
    mathjax: 'plugin/math/MathJax/MathJax.js',
    config: 'TeX-AMS_HTML-full',
  },
  chalkboard: {
    src: null,
    theme: 'whiteboard',
    toggleNotesButton: true,
    color: [ 'rgba(36,71,143,1)', 'rgba(255,255,255,0.5)' ],
  },
  'embed-video': {
    enabled: true, // optional, default false
    persistent: false, // optional, default false
    path: 'css',
  },
  dependencies: [
    { src: 'plugin/markdown/marked.js' },
    { src: 'plugin/markdown/markdown.js' },
    { src: 'plugin/math-katex/math-katex.js', async: true },
    { src: 'plugin/chalkboard/chalkboard.js' },
    { src: 'js/reveal-embed-video.js' },
    { src: 'plugin/notes/notes.js', async: true },
    { src: 'plugin/zoom-js/zoom.js', async: true },
    { src: 'plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } }
  ],
  keyboard: {
    67: function() { console.log('c'); RevealChalkboard.toggleNotesCanvas() },	// toggle notes canvas when 'c' is pressed
    66: function() { RevealChalkboard.toggleChalkboard() },	// toggle chalkboard when 'b' is pressed
    46: function() { RevealChalkboard.clear() },	// clear chalkboard when 'DEL' is pressed
    8: function() { RevealChalkboard.reset() },	// reset chalkboard data on current slide when 'BACKSPACE' is pressed
    68: function() { RevealChalkboard.download() },	// downlad recorded chalkboard drawing when 'd' is pressed
  },
});

/* ====================================================================================== *\
                                      PDF EXPORT
\* ====================================================================================== */

if (ispdf) {
  var checkExist = setInterval(function() {
    if ($('.pdf-page').length) {

      // === Per pdf-page operations

      $('.pdf-page').each(function (i, pdf) {

        // --- First slide
        $(pdf).find('section[data-state=FirstSlide]').each( function (j, FS) {

          // Top bar
          var tb = $('<div>').addClass('top_bar');
          $('logo').filter( ".institution" ).each(function(k, logo) {
            tb.append($('<img>', {src: logo.getAttribute('src')}));
          });
          $(FS).parent().append(tb);

          // Background
          $(FS).prev().css('background-color', '#fafaff');  

        });

        // --- Fixed header
        var h1 = $(pdf).find('h1');
        if (h1.length) {
          var tmp = $('<div>').addClass('fixed_header');
          tmp.html(h1.first().html());
          $(pdf).append(tmp);
        }

        // --- Last slide(s)
        $(pdf).find('section[data-state=LastSlide]').each( function (j, LS) {

          // Top bar
          var tb = $('<div>').addClass('top_bar');
          $('logo').filter( ".institution" ).each(function(k, logo) {
            tb.append($('<img>', {src: logo.getAttribute('src')}));
          });
          $(LS).parent().append(tb);

          // Background
          $(LS).prev().css('background-color', '#fafaff');

          // Bottom bar
          var bb = $('<div>').addClass('bottom_bar');
          if ($('logo').length) { bb.append('<p>Supported by</p>'); }
          $('logo').filter( ".funding" ).each(function(k, logo) {
            bb.append($('<img>', {src: logo.getAttribute('src')}));
          });
          $(LS).parent().append(bb);

        });

        // --- Citations

        var citations = $(pdf).find('cite');
        if (citations.length) {

          var bb = $('<div>').addClass('bottom_bar');
          var cont = $('<div>').addClass('citation_container');

          citations.each(function(j, cite) {
            if (j<4) {
              cont.append("<span class='citation'>"+$(cite).html()+'</span>');
            }
          });

          bb.append(cont);
          $(pdf).append(bb);
        }

        // --- Bibliography
        $(pdf).find('section[data-state=bibliography]').each( function (j, biblio) {

          buildBiblio($(pdf));

        });

      });

      // --- Stop timer  
      clearInterval(checkExist);
    }
  }, 100);
}

/* ====================================================================================== *\
                                      FUNCTIONS
\* ====================================================================================== */

function ispdf() {

  if (window.location.search.match(/^\?print\-pdf/)) { return true; }
  return false;  
}

function getSlide(event) {
  var slide = $(event.currentTarget).children().children().filter("section[class='present']");
  if (!slide.length) {
    slide = $(event.currentTarget).children().children().children().filter("section[class='present']");
  }
  return slide;
}

/* ====================================================================================== *\
                                      SLIDE EVENTS
\* ====================================================================================== */

/* ------------------------------------------------------------- *\
                         Manage overview
\* ------------------------------------------------------------- */

Reveal.addEventListener( 'overviewshown', function( event ) { 

  $('#fixed_header').hide();
  $('#top_bar').hide();
  $('#bottom_bar').hide();  
  $('body').css('background-color', 'white');

  $('h1').show();

} );

Reveal.addEventListener( 'overviewhidden', function( event ) {

  $('h1').hide();
  Reveal.sync();

  // --- Get slide
  var slide = getSlide(event);
  BuildSlide(slide);

} );

/* ------------------------------------------------------------- *\
                         Any new slide
\* ------------------------------------------------------------- */

Reveal.addEventListener( 'slidechanged', function(event) {

  // --- Build slide
  var slide = getSlide(event);
  BuildSlide(slide);

}, false );


function BuildSlide(slide) {

  if (Reveal.isOverview()) {

    $('#top_bar').hide();
    $('#bottom_bar').hide();

  } else {

    var hide_top = true;
    var hide_bottom = true;

    // --- Slide header
    var header = slide.children().filter("h1");
    header.hide();
    if (header.length) {
      $('#fixed_header').show().html(header.html());
    } else {
      $('#fixed_header').hide();
    }

    // --- Citations
    var citations = slide.children().filter('cite');
    if (citations.length) {
      $('#bottom_bar').html("<div id='citation_container'></div>");
      hide_bottom = false; 
    }
    citations.each(function(i) {
      if (i<4) {
        $('#citation_container').append("<span class='citation'>"+$(this).html()+'</span>');
      }
    });

    // --- Background color
    if (slide.attr('data-state')=='FirstSlide' || slide.attr('data-state')=='LastSlide') {
      $('body').css('background-color', '#fafaff');
    } else {
      $('body').css('background-color', 'white');
    }

    // --- Top and bottom bars
    if (slide.attr('data-state')=='FirstSlide') {
      hide_top = false;
      hide_bottom = true;
    }

    if (slide.attr('data-state')=='LastSlide') {
      hide_top = false;
      hide_bottom = false;
    }

    // Visibility and display
    $('#bottom_bar').css('visibility', 'visible');
    if (hide_top) { $('#top_bar').hide(); } else { $('#top_bar').show(); }
    if (hide_bottom) { $('#bottom_bar').hide(); } else { $('#bottom_bar').show(); }
  }

}

/* ------------------------------------------------------------- *\
                         First slide
\* ------------------------------------------------------------- */


Reveal.addEventListener( 'FirstSlide', function(event) {

  // --- Clear top bar content
  $('#top_bar').html('');

  // --- Set top bar content (institutional logos)
  $('logo').filter( ".institution" ).each(function(i,v) {
    $('#top_bar').append($('<img>', {src: v.getAttribute('src')}));
  });

}, false );

/* ------------------------------------------------------------- *\
                          Last slide
\* ------------------------------------------------------------- */

Reveal.addEventListener( 'LastSlide', function(event) {

  // --- Clear bars content
  $('#top_bar').html('');
  $('#bottom_bar').html('');

  // --- Set top bar content (institutional logos)
  $('logo').filter( ".institution" ).each(function(i,v) {
    $('#top_bar').append($('<img>', {src: v.getAttribute('src')}));
  });

  // --- Set bottom bar content (funding logos)
  var fa = $('logo').filter( ".funding" );
  if (fa.length) {
    $('#bottom_bar').append('<p>Supported by</p>');
  }
  fa.each(function(i,v) {
    $('#bottom_bar').append($('<img>', {src: v.getAttribute('src')}));
  });

}, false );

/* ------------------------------------------------------------- *\
                         Bibliography
\* ------------------------------------------------------------- */

function buildBiblio(slide) {

  var ncpp = 10;

  var table = $("<table class='citation_table'>");

  $('cite').each( function(i) {

    if ((i%ncpp)==0) {
      if (ispdf()) {
        var tmp = $('<div>').addClass('fixed_header');
        tmp.html('Bibliography');
        slide.append(tmp);
        slide.append($('<br>'));
      } else {
        slide.append("<h1>Bibliography</h1>");
      }
    }

    var c1 = $('<th>').text(i+1);
    var c2 = $('<td>').append($(this).html());
    var row = $('<tr>');
    row.append(c1).append(c2);
    table.append(row);

    if ((i%ncpp)==ncpp-1 && i<$('cite').length-1) {
      slide.append(table);
      if (ispdf()) {
        slide.after("<div class='pdf-page' style='" + $(slide).attr('style') + "'></div");
        slide = slide.next();
      } else {
        if (i==ncpp-1) { Reveal.sync(); }
        slide.after('<section></section>');
        slide = slide.next();
      }
      table = $("<table class='citation_table'>");
    }

  });

  slide.append(table);

}

Reveal.addEventListener( 'bibliography', function(event) {

  // --- Get slide
  var slide = getSlide(event);

  // Do not pursue if the bibliography is already present
  if (slide.html().length) { return; }  

  buildBiblio(slide);

}, false );