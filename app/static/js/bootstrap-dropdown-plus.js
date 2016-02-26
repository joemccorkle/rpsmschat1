!function ($) {

  "use strict"; // jshint ;_;

  /* ORIGINAL DROPDOWN FUNCTION OBJECT
   * ================================= */

  var _super = $.fn.dropdown;


  /* DROPDOWN PLUS CLASS DEFINITION
   * ============================== */

  var toggle = '[data-toggle=dropdown]';
  var DropdownPlus = function (element, options) {
    this.options = options;

    if (this.options.hover) {
      $(element).on('mouseover.dropdown.data-api', this.mouseover);
    } else {
      _super.Constructor.apply(this);
    }
  };


  /* DROPDOWN PLUS EXTENSION
   * ======================= */

  DropdownPlus.prototype = $.extend({}, _super.Constructor.prototype, {
    constructor: DropdownPlus,
    mouseover: function (e) {
      var $this = $(this);
      var $parent;
      var isActive;

      if ($this.is('.disabled, :disabled')) {
        return;
      }

      $parent = getParent($this);

      if ($parent.data('timeout')) {
        clearTimeout($parent.data('timeout'));
      }

      isActive = $parent.hasClass('open');

      if (isActive) {
        return;
      }

      $parent.data('child', $this);

      clearMenus();

      $parent.toggleClass('open');

      $parent.on('mouseleave.dropdown.data-api', DropdownPlus.prototype.mouseleave)
        .find('.dropdown-menu').on('mouseover.dropdown.data-api', DropdownPlus.prototype.mouseover);

      return false;
    },
    mouseleave: function (e) {
      var $this = $(this);
      var $child;
      var isActive;

      if ($this.is('.disabled, :disabled')) {
        return;
      }

      $child = getChild($this);

      isActive = $this.hasClass('open');

      if (!isActive) {
        return;
      }

      if ($this.data('timeout')) {
        clearTimeout($this.data('timeout'));
      }

      $this.data('timeout',
        setTimeout(function () {
          $this.toggleClass('open').find('.dropdown-menu').off('mouseover.dropdown.data-api');
        }, $child.data('hover-timeout') || $.fn.dropdown.dropdown.hoverTimeout)
      );

      return false;
    }
  });

  function clearMenus() {
    $('.dropdown-backdrop').remove();
    $(toggle).each(function () {
      getParent($(this)).removeClass('open');
    });
  }

  function getParent($this) {
    var selector = $this.attr('data-target');
    var $parent;

    if (!selector) {
      selector = $this.attr('href');
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
    }

    $parent = selector && $(selector);

    if (!$parent || !$parent.length){
      $parent = $this.parent();
    }

    return $parent;
  }

  function getChild($this) {
    return $this.data('child') || $this.find(toggle);
  }


  /* DROPDOWN PLUS PLUGIN DEFINITION
   * =============================== */

  $.fn.dropdown = $.extend(function () {
    var args = $.makeArray(arguments);
    var option = args.shift();

    return this.each(function () {
      var $this = $(this);
      var data = $this.data('dropdown');
      var options = $.extend({}, $.fn.modal.dropdown, $this.data(), typeof option == 'object' && option);

      if (!data) {
        $this.data('dropdown', (data = new DropdownPlus(this, options)));
      }

      if (typeof option == 'string') {
        data[option].apply(data, args);
      }
    });
  }, $.fn.dropdown);


  /* DROPDOWN PLUS DEFAULTS
   * ====================== */

  $.fn.dropdown.dropdown = {
    hover: false,
    hoverTimeout: 0
  };

  $.fn.dropdown.Constructor = DropdownPlus;

  $(document)
    .off('click.dropdown.data-api')
    .on('click.dropdown.data-api', clearMenus)
    .on('click.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.dropdown.data-api'  , toggle + ':not([data-hover])', DropdownPlus.prototype.toggle)
    .on('click.dropdown.data-api'  , toggle + '[data-hover]', function (e) { e.stopPropagation(); e.preventDefault(); $(this).blur(); })
    .on('keydown.dropdown.data-api', toggle + ', [role=menu]' , DropdownPlus.prototype.keydown)
    .on('mouseover.dropdown.data-api', toggle + '[data-hover]' , DropdownPlus.prototype.mouseover);

}(window.jQuery);
