(function ($) {
  var $window = $(window),
    $body = $("body"),
    $main = $("#main");

  // Breakpoints.
  breakpoints({
    xlarge: ["1281px", "1680px"],
    large: ["981px", "1280px"],
    medium: ["737px", "980px"],
    small: ["481px", "736px"],
    xsmall: ["361px", "480px"],
    xxsmall: [null, "360px"],
  });

  // Play initial animations on page load.
  $window.on("load", function () {
    window.setTimeout(function () {
      $body.removeClass("is-preload");
    }, 100);
  });

  // Nav.
  var $nav = $("#nav");

  if ($nav.length > 0) {
    // Shrink effect.
    $main.scrollex({
      mode: "top",
      enter: function () {
        $nav.addClass("alt");
      },
      leave: function () {
        $nav.removeClass("alt");
      },
    });

    // Links.
    var $nav_a = $nav.find("a");

    $nav_a
      .scrolly({
        speed: 1000,
        offset: function () {
          return $nav.height();
        },
      })
      .on("click", function () {
        var $this = $(this);

        // External link? Bail.
        if ($this.attr("href").charAt(0) != "#") return;

        // Deactivate all links.
        $nav_a.removeClass("active").removeClass("active-locked");

        // Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
        $this.addClass("active").addClass("active-locked");
      })
      .each(function () {
        var $this = $(this),
          id = $this.attr("href"),
          $section = $(id);

        // No section for this link? Bail.
        if ($section.length < 1) return;

        // Scrollex.
        $section.scrollex({
          mode: "middle",
          initialize: function () {
            // Deactivate section.
            if (browser.canUse("transition")) $section.addClass("inactive");
          },
          enter: function () {
            // Activate section.
            $section.removeClass("inactive");

            // No locked links? Deactivate all links and activate this section's one.
            if ($nav_a.filter(".active-locked").length == 0) {
              $nav_a.removeClass("active");
              $this.addClass("active");
            }

            // Otherwise, if this section's link is the one that's locked, unlock it.
            else if ($this.hasClass("active-locked"))
              $this.removeClass("active-locked");
          },
        });
      });
  }

  // Scrolly.
  $(".scrolly").scrolly({
    speed: 1000,
  });

  // Gallery.
  $(".gallery")
    .wrapInner('<div class="inner"></div>')
    .prepend(
      browser.mobile
        ? ""
        : '<div class="forward"></div><div class="backward"></div>'
    )
    .scrollex({
      top: "30vh",
      bottom: "30vh",
      delay: 50,
      initialize: function () {
        $(this).addClass("is-inactive");
      },
      terminate: function () {
        $(this).removeClass("is-inactive");
      },
      enter: function () {
        $(this).removeClass("is-inactive");
      },
      leave: function () {
        var $this = $(this);

        if ($this.hasClass("onscroll-bidirectional"))
          $this.addClass("is-inactive");
      },
    })
    .children(".inner")
    //.css('overflow', 'hidden')
    .css("overflow-y", browser.mobile ? "visible" : "hidden")
    .css("overflow-x", browser.mobile ? "scroll" : "hidden")
    .scrollLeft(0);

  // Style #1.
  // ...

  // Style #2.
  $(".gallery")
    .on("wheel", ".inner", function (event) {
      var $this = $(this),
        delta = event.originalEvent.deltaX * 10;

      // Cap delta.
      if (delta > 0) delta = Math.min(25, delta);
      else if (delta < 0) delta = Math.max(-25, delta);

      // Scroll.
      $this.scrollLeft($this.scrollLeft() + delta);
    })
    .on("mouseenter", ".forward, .backward", function (event) {
      var $this = $(this),
        $inner = $this.siblings(".inner"),
        direction = $this.hasClass("forward") ? 1 : -1;

      // Clear move interval.
      clearInterval(this._gallery_moveIntervalId);

      // Start interval.
      this._gallery_moveIntervalId = setInterval(function () {
        $inner.scrollLeft($inner.scrollLeft() + 5 * direction);
      }, 10);
    })
    .on("mouseleave", ".forward, .backward", function (event) {
      // Clear move interval.
      clearInterval(this._gallery_moveIntervalId);
    });

  // Lightbox.
  $(".gallery.lightbox")
    .on("click", "a", function (event) {
      var $a = $(this),
        $gallery = $a.parents(".gallery"),
        $modal = $gallery.children(".modal"),
        $modalImg = $modal.find("img"),
        href = $a.attr("href");

      // Not an image? Bail.
      if (!href.match(/\.(jpg|gif|png|mp4)$/)) return;

      // Prevent default.
      event.preventDefault();
      event.stopPropagation();

      // Locked? Bail.
      if ($modal[0]._locked) return;

      // Lock.
      $modal[0]._locked = true;

      // Set src.
      $modalImg.attr("src", href);

      // Set visible.
      $modal.addClass("visible");

      // Focus.
      $modal.focus();

      // Delay.
      setTimeout(function () {
        // Unlock.
        $modal[0]._locked = false;
      }, 600);
    })
    .on("click", ".modal", function (event) {
      var $modal = $(this),
        $modalImg = $modal.find("img");

      // Locked? Bail.
      if ($modal[0]._locked) return;

      // Already hidden? Bail.
      if (!$modal.hasClass("visible")) return;

      // Lock.
      $modal[0]._locked = true;

      // Clear visible, loaded.
      $modal.removeClass("loaded");

      // Delay.
      setTimeout(function () {
        $modal.removeClass("visible");

        setTimeout(function () {
          // Clear src.
          $modalImg.attr("src", "");

          // Unlock.
          $modal[0]._locked = false;

          // Focus.
          $body.focus();
        }, 475);
      }, 125);
    })
    .on("keypress", ".modal", function (event) {
      var $modal = $(this);

      // Escape? Hide modal.
      if (event.keyCode == 27) $modal.trigger("click");
    })
    .prepend(
      '<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>'
    )
    .find("img")
    .on("load", function (event) {
      var $modalImg = $(this),
        $modal = $modalImg.parents(".modal");

      setTimeout(function () {
        // No longer visible? Bail.
        if (!$modal.hasClass("visible")) return;

        // Set loaded.
        $modal.addClass("loaded");
      }, 275);
    });
})(jQuery);
