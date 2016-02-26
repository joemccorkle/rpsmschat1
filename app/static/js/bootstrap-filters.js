$(function() {
  $(document).on('click', '@sid-search', function () {
    $(this).closest('form').submit();
  }).on('click', '@toggle-filters', function () {
      var $this = $(this);
      var $filterRow = $('#filter-row');

      if ($filterRow.is(':hidden')) {
        $filterRow.show();
        $('i', $this).addClass('icon-angle-double-up')
          .removeClass('icon-angle-double-down')
          .html('&nbsp;Hide Filters');
      } else {
        $filterRow.hide();
        $('i', $this).addClass('icon-angle-double-down')
          .removeClass('icon-angle-double-up')
          .html('&nbsp;Show Filters');
      }

    });
});
