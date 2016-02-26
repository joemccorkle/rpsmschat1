// NOTICE!! DO NOT USE ANY OF THIS JAVASCRIPT
// IT'S ALL JUST JUNK FOR OUR DOCS!
// ++++++++++++++++++++++++++++++++++++++++++

!function ($) {

  $(function () {

    var $window = $(window);

    // Disable certain links in docs
    $('section [href^=#]').click(function (e) {
      e.preventDefault();
    });

    // side bar
    setTimeout(function () {
      $('.bs-docs-sidenav').affix({
        offset: {
          top: function () {
            return $window.width() <= 980 ? 290 : 210;
          }, bottom: 270
        }
      })
    }, 100);

    // make code pretty
    window.prettyPrint && prettyPrint();

    // add-ons
    $('.add-on :checkbox').on('click', function () {
      var $this = $(this)
          , method = $this.attr('checked') ? 'addClass' : 'removeClass';
      $(this).parents('.add-on')[method]('active');
    });

    // add tipsies to grid for scaffolding
    if ($('#gridSystem').length) {
      $('#gridSystem').tooltip({
        selector: '.show-grid > [class*="span"]', title: function () {
          return $(this).width() + 'px';
        }
      });
    }

    // tooltip demo
    $('.tooltip-demo').tooltip({
      selector: "a[data-toggle=tooltip]"
    });

    $('.tooltip-test').tooltip();
    $('.popover-test').popover();

    // popover demo
    $("a[data-toggle=popover]")
        .popover()
        .click(function (e) {
          e.preventDefault();
        });

    // button state demo
    $('#fat-btn')
        .click(function () {
          var btn = $(this);
          btn.button('loading');
          setTimeout(function () {
            btn.button('reset');
          }, 3000)
        });

    // carousel demo
    $('#myCarousel').carousel();

    // javascript build logic
    var inputsComponent = $("#components.download input")
        , inputsPlugin = $("#plugins.download input")
        , inputsVariables = $("#variables.download input");

    // toggle all plugin checkboxes
    $('#components.download .toggle-all').on('click', function (e) {
      e.preventDefault();
      inputsComponent.attr('checked', !inputsComponent.is(':checked'));
    });

    $('#plugins.download .toggle-all').on('click', function (e) {
      e.preventDefault();
      inputsPlugin.attr('checked', !inputsPlugin.is(':checked'));
    })

    $('#variables.download .toggle-all').on('click', function (e) {
      e.preventDefault();
      inputsVariables.val('');
    })

    // request built javascript
    $('.download-btn .btn').on('click', function () {

      var css = $("#components.download input:checked")
              .map(function () {
                return this.value;
              })
              .toArray()
          , js = $("#plugins.download input:checked")
              .map(function () {
                return this.value;
              })
              .toArray()
          , vars = {}
          , img = ['glyphicons-halflings.png', 'glyphicons-halflings-white.png'];

      $("#variables.download input")
          .each(function () {
            $(this).val() && (vars[ $(this).prev().text() ] = $(this).val());
          });

      $.ajax({
        type: 'POST', url: /\?dev/.test(window.location) ? 'http://localhost:3000' : 'http://bootstrap.herokuapp.com', dataType: 'jsonpi', params: {
          js: js, css: css, vars: vars, img: img
        }
      });
    });


    $('.spotlight, @spotlight').bind('mouseover', function () {
      $(this).spotlight();
    });

    if (typeof(initExpandify) != 'undefined') {
      initExpandify();
    }

    if ($('@datetimepicker').datetimepicker) {
      $('@datetimepicker').datetimepicker({});
    }

    $('select').selectize({
      plugins: [],
      delimiter: ','
    });
  });

  // Modified from the original jsonpi https://github.com/benvinegar/jquery-jsonpi
  $.ajaxTransport('jsonpi', function (opts, originalOptions, jqXHR) {
    var url = opts.url;

    return {
      send: function (_, completeCallback) {
        var name = 'jQuery_iframe_' + jQuery.now()
            , iframe, form;

        iframe = $('<iframe>')
            .attr('name', name)
            .appendTo('head');

        form = $('<form>')
            .attr('method', opts.type) // GET or POST
            .attr('action', url)
            .attr('target', name);

        $.each(opts.params, function (k, v) {

          $('<input>')
              .attr('type', 'hidden')
              .attr('name', k)
              .attr('value', typeof v == 'string' ? v : JSON.stringify(v))
              .appendTo(form);
        });

        form.appendTo('body').submit();
      }
    }
  });

  if ($('#list-page').length > 0) {
    $('#show-button-group').click(function () {
      $('#button-group').fadeToggle();
    });

    $('#show-tab-group').click(function () {
      $('#tab-group').fadeToggle();
    });

    $('#show-filter-group').click(function () {
      $('#filter-group').fadeToggle();
    });

    $('#show-inline-group').click(function () {
      $('.inline-group').fadeToggle();
    });

    $(".scroll").click(function (event) {
      event.preventDefault();
      //calculate destination place
      var dest = 0;
      if ($(this.hash).offset().top > $(document).height() - $(window).height()) {
        dest = $(document).height() - $(window).height();
      } else {
        dest = $(this.hash).offset().top;
      }
      //go to destination
      $('html,body').animate({scrollTop: dest}, 1000, 'swing');
    });
  }

  if ($('#editable-instance-page').length > 0) {
    $('#show-properties-group').click(function () {
      $('#properties-group').fadeToggle();
    });

    $('#show-form-group').click(function () {
      $('#form-group').fadeToggle();
    });

    $('#show-subresource').click(function () {
      $('#subresources-group').fadeToggle();
    });

    $('#show-danger-zone').click(function () {
      $('#danger-zone').fadeToggle();
    });

    $('#show-media-group').click(function () {
      $('#media-group').fadeToggle();
    });

    $(".scroll").click(function (event) {
      event.preventDefault();
      //calculate destination place
      var dest = 0;
      if ($(this.hash).offset().top > $(document).height() - $(window).height()) {
        dest = $(document).height() - $(window).height();
      } else {
        dest = $(this.hash).offset().top;
      }
      //go to destination
      $('html,body').animate({scrollTop: dest}, 1000, 'swing');
    });
  }
  $(document).on('click submit','@stop-propagation', function (e) {
    e.stopPropagation();
  });
  $(document).on('click submit', '@prevent-default', function (e) {
    e.preventDefault();
  });

}(window.jQuery);
