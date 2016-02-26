var initExpandify = function (context) {
  context = context || document;

  $('@expandify', context).each(function () {
    var $this = $(this);

    if ($this.parent().hasClass('section-header')) {
      $this.parent().css('margin-bottom', 0);
    }

    var id = $this.attr('id');
    if (id === undefined) {
      id = 'expandify-' + $this.data('target').substr(1);
      $this.attr('id', id);
    }

    var target = $($this.data('target'), context);
    target.data('related', '#' + id);
  }).click(function (e) {
    e.preventDefault();
  });

};

$(function () {
  $(document).on('hide hidden', '.collapse', function (event) {
    if (event.target != this) {
      return;
    }

    var $this = $(this);
    if ($this.data('related')) {
      var label = $($this.data('related'));
      var showCaret = label.data('caret') || false;
      if (showCaret) {
        label.html('<i class="icon icon-115x icon-caret-right"></i> ' + label.data('text-open') || 'more');
      } else {
        label.html(label.data('text-open') || 'more');
      }
      var noBorder = label.data('unbordered') || false;
      if (noBorder) {
        $this.prev().css('border-bottom', '1px solid #e5e5e5');
      }
    }
  }).on('show shown', '.collapse', function (event) {
    if (event.target != this) {
      return;
    }

    var $this = $(this);
    if ($this.data('related')) {
      var label = $($this.data('related'));
      var showCaret = label.data('caret') || false;
      if (showCaret) {
        label.html('<i class="icon icon-115x icon-caret-down"></i> ' + label.data('text-close') || 'less');
      } else {
        label.html(label.data('text-close') || 'less');
      }

      var noBorder = label.data('unbordered') || false;
      if (noBorder) {
        $this.prev().css('border-bottom', 'none');
      }
    }
  });

});
