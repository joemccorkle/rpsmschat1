!function ($) {

  "use strict"; // jshint ;_;

  /* ORIGINAL MODAL FUNCTION OBJECT
   * ============================== */

  var _super = $.fn.modal;


  /* MODAL PLUS CLASS DEFINITION
   * =========================== */

  var ModalPlus = function (element, options) {
    var that = this;
    _super.Constructor.apply(this, arguments);

    this.$element
      .delegate('[data-pop="modal"]', 'click.modal.pop', function (e) {
        e.preventDefault();
        $.proxy(that.pop, that, $(this).data('relindex'))();
      })
      .delegate('[data-push="modal"]', 'click.modal.push', function (e) {
        var $this = $(this);
        var href = $this.attr('href');
        var $target = $($this.attr('data-target') || (href && /#/.test(href) && href.replace(/.*(?=#[^\s]+$)/, ''))); //strip for ie7
        var load = $this.attr('data-load') || (href && !/#/.test(href) && href.replace(/.*(?=#[^\s]+$)/, '')); //strip for ie7

        e.preventDefault();

        var d = $.Deferred();

        if (!/#/.test(load) && load && !$target.length) {
          if ($this.attr('data-loading-text') && $.fn.button) {
            $this.button('loading');
            d.always(function () {
              $this.button('reset');
            });
          }
          $.ajax({
            'type': 'GET',
            'url': load
          }).done(function (html) {
            $target = $(html);
          }).success(d.resolve).fail(d.reject).fail(that.options.errorCallback);
        } else {
          var $parent = $target;
          $target = $parent.children().data('parent', $parent);
          d.resolve();
        }

        d.done(function () {
          $.proxy(that.push, that, $target, $this.data('title'))();
        });
      })
      .on('shown', function () {
        that.refresh();
      })
      .on('hidden', function () {
        that.$element.removeClass('scrollable').find('.modal-body')
          .css('max-height', '')
          .data('max-height', null);

        if (!that.$window || !that.$wrapper) {
          return;
        }
        var $views = that.$wrapper.css('left', '0%').find('.modal-view:gt(0)');
        that.removeViews($views);
        var $view = that.$wrapper.find('.modal-view');
        that.$window.height($view.data('height'));
        that.$element.find('.modal-header h3').text($view.data('title'));
        that.$element.find('.modal-header [data-pop="modal"]').remove();
      });
  };


  /* MODAL PLUS EXTENSION
   * ==================== */

  ModalPlus.prototype = $.extend({}, _super.Constructor.prototype, {
    constructor: ModalPlus,
    _super: function () {
      var args = $.makeArray(arguments);
      _super.Constructor.prototype[args.shift()].apply(this, args);
    },
    show: function () {
      var viewPort = $(window).height();
      var marginTop = viewPort * 0.1; // margin will be 10% when animation is complete

      if (viewPort - marginTop < this.$element.height()) {
        this.$element.addClass('scrollable');
      }

      this._super('show');
    },
    hideModal: function () {
      if (this.$wrapper) {
        var $views = this.$wrapper.find('.modal-view');
        for (var i = $views.length; i > 1; i--) {
          this.removeViews($views.eq(i - 1));
        }
      }

      this._super('hideModal');
    },
    push: function (element, title) {
      var that = this;
      var e = $.Event('push');

      this.$element.trigger(e);

      if (!this.isShown || e.isDefaultPrevented()) {
        return;
      }

      if (typeof element == 'undefined') {
        return;
      }

      this.ensureFrame();

      var $view = $('<div />')
        .addClass('modal-view')
        .append(element);

      element.show();

      if (title) {
        $view.data('title', title);
        this.title(title);
      }

      this.$wrapper.append($view);

      if (!element.children().data('parent')) {
        this.$element.trigger('loaded');
      }

      this.$wrapper.animate({left: '-=100%'}, 500);

      if (this.options.backbutton) {
        this.showBackButton();
      }

      this.refresh();

      this.$window.promise().done(function () {
        that.$element.focus().trigger('pushed');
      });
    },
    pop: function (relIndex) {
      var that = this;
      var e = $.Event('pop');

      this.$element.trigger(e);

      if (!this.isShown || e.isDefaultPrevented()) {
        return;
      }

      relIndex = relIndex || 0;

      this.ensureFrame();

      var $views = this.$wrapper.find('.modal-view');

      if ($views.length < 2) {
        return;
      }

      if (relIndex > 1) {
        for (var i = relIndex; i > 1; i--) {
          if (i != $views.length) {
            this.removeViews($views.eq(i - 1));
          }
        }

        $views = this.$wrapper.find('.modal-view');

        var left = parseInt(this.$wrapper.css('left'), 10) / this.$window.width();

        this.$wrapper.css('left', ((left + relIndex - 1) * 100) + '%');
      }

      var $prev = $views.eq(-2);

      if (this.options.backbutton && $views.length == 2) {
        this.hideBackButton();
      }

      this.$wrapper.animate({left: '+=100%'}, function () {
        that.removeViews($views.eq(-1));
      });

      if ($prev.data('title')) {
        this.title($prev.data('title'));
      }

      this.refresh($prev.data('height'));

      this.$window.promise().done(function () {
        that.$element.focus().trigger('popped');
      });
    },
    title: function (title) {
      var $title = this.$element.find('.modal-header h3');

      if (!title || $title.text() == title) {
        return;
      }

      $title.animate({opacity: 0}, function () {
        $title.text(title).animate({opacity: 1});
      });
    },
    refresh: function (height) {
      this.ensureBodyHeight();

      if (!this.$window || !this.$wrapper) {
        return;
      }

      var $view = this.$wrapper.find('.modal-view:last');

      if (!height) {
        var $body = $view.find('.modal-body');
        var $footer = $view.find('.modal-footer');

        if ($body.data('max-height')) {
          var bodyHeight = $body.data('max-height') + $footer.outerHeight();

          height = Math.min($view.height(), bodyHeight);
        } else {
          height = $view.height();
        }
      }

      this.$window.animate({height: height + 'px'}, 300);
      $view.data('height', height);
    },
    ensureBodyHeight: function () {
      if (!this.$element.is('.scrollable')) {
        return;
      }

      var $header = this.$element.find('.modal-header:last');
      var $footer = this.$element.find('.modal-footer:last');

      var maxHeight = $(window).height() - ($header.outerHeight() + $footer.outerHeight() + 1);

      this.$element.find('.modal-body:last')
        .css('max-height',  maxHeight)
        .data('max-height', maxHeight);
    },
    ensureFrame: function () {
      if (this.$element.find('.modal-view-window').length) {
        return;
      }

      var $body = this.$element.find('.modal-body');
      var $footer = this.$element.find('.modal-footer');

      var height = $body.outerHeight() + $footer.outerHeight();

      var $view = $('<div />')
        .addClass('modal-view')
        .append($body)
        .append($footer)
        .data('height', height)
        .data('title', this.$element.find('.modal-header h3').text());

      this.$wrapper = $('<div />')
        .addClass('modal-view-wrapper')
        .append($view);

      this.$window = $('<div />')
        .addClass('modal-view-window')
        .height(height)
        .append(this.$wrapper)
        .appendTo(this.$element);
    },
    showBackButton: function () {
      var $header = this.$element.find('.modal-header');
      if ($header.find('[data-pop="modal"]').length) {
        return;
      }
      $('<button />')
        .attr('type', 'button')
        .attr('data-pop', 'modal')
        .addClass('back')
        .addClass('btn')
        .addClass('hide')
        .html('&#10094; Back')
        .prependTo($header)
        .fadeIn();
    },
    hideBackButton: function () {
      this.$element.find('.modal-header [data-pop="modal"]').fadeOut(function () {
        $(this).remove();
      });
    },
    removeViews: function (views) {
      views.each(function () {
        var $this = $(this);
        $this.children().each(function () {
          var $child = $(this);
          if ($child.data('parent')) {
            $child.appendTo($child.data('parent'));
          }
        });
        $this.remove();
      });
    }
  });

  /* MODAL PLUS PLUGIN DEFINITION
   * ============================ */

  $.fn.modal = $.extend(function () {
    var args = $.makeArray(arguments);
    var option = args.shift();

    return this.each(function () {
      var $this = $(this);
      var data = $this.data('modal');
      var options = $.extend({}, _super.defaults, $this.data(), typeof option == 'object' && option);

      if (!data) {
        $this.data('modal', (data = new ModalPlus(this, options)));
      }

      if (typeof option == 'string') {
        data[option].apply(data, args);
      } else if (options.show) {
        data.show.apply(data, args);
      }
    });
  }, $.fn.modal);


  /* MODAL PLUS DEFAULTS
   * =================== */

  $.extend(_super.defaults, {
    backbutton: true,
    errorCallback: function (jqXHR) {}
  });


  /* MODAL PLUS DATA-API
   * =================== */

  $(document).off('click.modal.data-api').on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this);
    var href = $this.attr('href');
    var $target = $($this.attr('data-target') || (href && /#/.test(href) && href.replace(/.*(?=#[^\s]+$)/, ''))); //strip for ie7
    var load = $this.attr('data-load') || (href && !/#/.test(href) && href.replace(/.*(?=#[^\s]+$)/, '')); //strip for ie7
    var option = 'toggle';

    e.preventDefault();

    var d = $.Deferred();

    if (!$target.data('modal')) {
      if (!/#/.test(load) && load && !$target.length) {
        if ($this.attr('data-loading-text') && $.fn.button) {
          $this.button('loading');
          d.then(function () {
            $this.button('reset');
          });
        }
        $.ajax({
          'type': 'GET',
          'url': load
        }).done(function (html) {
          var $content = $(html).appendTo(document.body);
          $target = $content.filter('.modal').on('hidden', function (e) {
            if (e.target !== this) {
              return;
            }
            $content.remove();
          });
          var e = $.Event('loaded');
          $target.trigger(e);
        }).always(d.resolve).fail($.fn.modal.defaults.errorCallback);
      } else {
        load = false;
        d.resolve();
      }

      d.then(function () {
        option = $.extend({ remote: !load && !/#/.test(href) && href }, $target.data(), $this.data());
      });
    } else {
      d.resolve();
    }

    d.done(function () {
      $target
        .modal(option)
        .one('hide', function () {
          $this.focus();
        });
    });
  });

}(window.jQuery);
