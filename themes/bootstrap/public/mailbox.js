var baseURL = window.location.protocol + '//' + window.location.host;
var navBarOffset = 75;
var mediumDeviceWidth = 980;
var messageListMargin = 275;
var clipboard = null;
var messageListScroll = false;

// deleteMessage sends a delete request for a message
function deleteMessage(id) {
  $('#message-content').empty();
  $.ajax({
    type: 'DELETE',
    url: '/mailbox/' + mailbox + '/' + id,
    success: reloadList
  })
}

// flashTooltip temporarily changes the text of a tooltip
function flashTooltip(el, text) {
  var prevText = $(el).attr('data-original-title');
  $(el).attr('data-original-title', text).tooltip('show');
  $(el).attr('data-original-title', prevText);
}

// htmlView pops open another window for viewing message as HTML
function htmlView(id) {
  window.open('/mailbox/' + mailbox + '/' + id + "/html", '_blank',
      'width=800,height=600,' +
      'menubar=yes,resizable=yes,scrollbars=yes,status=yes,toolbar=yes');
}

// loadList displays the message list for this mailbox
function loadList() {
  $('#message-list').load('/mailbox/' + mailbox, onListLoaded);
}

// messageSource pops open another window for message source
function messageSource(id) {
  window.open('/mailbox/' + mailbox + '/' + id + "/source", '_blank',
      'width=800,height=600,' +
      'menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no');
}

// reloadList reloads the message list for this mailbox
function reloadList() {
  $('#message-list').hide();
  loadList();
}

// toggleMessageLink shows/hids the message link URL form
function toggleMessageLink(id) {
  var url = baseURL + '/link/' + mailbox + '/' + id;
  $('#link-input-control').val(url);
  $('#link-row').slideToggle();
}

// onDocumentChange is called each time we load partials into the DOM
function onDocumentChange() {
  // Bootstrap tooltips
  $('[data-toggle="tooltip"]').tooltip()

  // Clipboard functionality
  if (clipboard != null) {
    clipboard.destroy();
  }
  clipboard = new Clipboard('.btn-clipboard');
  clipboard.on('success', function(el) {
    flashTooltip(el.trigger, 'Copied!');
    el.clearSelection();
  });
  clipboard.on('error', function(el) {
    flashTooltip(el.trigger, 'Copy Failed!');
  });
}

// onDocumentReady is called by mailbox/index.html to initialize
function onDocumentReady() {
  $("#message-list").hide();
  onWindowResize();
  $(window).resize(onWindowResize);
  loadList();
}

// onListLoaded is called when the message list changes
function onListLoaded() {
  onDocumentChange();
  $('.listEntry').click(
      function() {
        $('.listEntry').removeClass("disabled");
        $(this).addClass("disabled");
        $('#message-content').load('/mailbox/' + mailbox + '/' + this.id, onMessageLoaded);
        selected = this.id;
      }
      )
    $("#message-list").slideDown();
  if (selected != "") {
    $("#" + selected).click();
    selected = "";
  }
}

// onMessageLoaded is called each time a new message is shown
function onMessageLoaded(responseText, textStatus, XMLHttpRequest) {
  if (textStatus == "error") {
    alert("Failed to load message, server said:\n" + responseText);
    return;
  }
  onDocumentChange();
  var top = $('#message-container').offset().top - navBarOffset;
  $(window).scrollTop(top);
}

// onWindowResize handles special cases when window is resized
function onWindowResize() {
  if ($(window).width() > mediumDeviceWidth) {
    if (!messageListScroll) {
      messageListScroll= true;
      var content_height = $(window).height() - messageListMargin;
      $('#message-list-wrapper').height(content_height).addClass("message-list-scroll");
    }
  } else {
    if (messageListScroll) {
      messageListScroll= false;
      $('#message-list-wrapper').height('auto').removeClass("message-list-scroll");
    }
  }
}
