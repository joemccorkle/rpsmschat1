$(function () {
    // Get handle to the chat div
    var $chatWindow = $('#messages');

    // Manages the state of our access token we got from the server
    var accessManager;

    // Our interface to the IP Messaging service
    var messagingClient;

    // The server will assign the client a random username - store that value
    // here
    var username;

    // Store the active channel's name here
    var activeChannel;

    // Helper function to print info messages to the chat window
    function print(infoMessage, asHtml) {
        var $msg = $('<div class="info">');
        if (asHtml) {
            $msg.html(infoMessage);
        } else {
            $msg.text(infoMessage);
        }
        $chatWindow.append($msg);
    }

    // Helper function to print chat message to the chat window
    function printMessage(fromUser, message) {
        var $user = $('<span class="username">').text(fromUser + ':');
        if (fromUser === username) {
            $user.addClass('me');
        }
        var $message = $('<span class="message">').text(message);
        var $container = $('<div class="message-container">');
        $container.append($user).append($message);
        $chatWindow.append($container);
        $chatWindow.scrollTop($chatWindow[0].scrollHeight);
    }

    // Helper functions to add a channel to the list
    function addRow(channelName) {
        var newRow = '';
        newRow += '<tr><td>';
        newRow += '<button class="btn btn-inverse channel" id="' + channelName + '">';
        newRow += channelName;
        newRow += '</button></td></tr>';
        $('#channels').find('tbody').append(newRow);
    }

    // Helper function to remove a channel from the list
    function removeRow(channelName) {
        var row = document.getElementById("channelName");
        row.parentNode.removeChild(row);
    }

    // Helper function to re-enable a button after it has been blocked
    var enableButton = function () {
        $('.btn').removeAttr('disabled');
    };

    // Alert the user they have been assigned a random username
    print('Logging in...');

    // Get an access token for the current user, passing a username (identity)
    // and a device ID - for browser-based apps, we'll always just use the
    // value "browser"
    $.getJSON('/token', {
        identity: username,
        device: 'browser'
    }, function (data) {
        // Alert the user they have been assigned a username
        username = data.identity;
        print('You have been assigned the username of: '
            + '<span class="me">' + username + '</span>', true);

        // Initialize the IP messaging client
        accessManager = new Twilio.AccessManager(data.token);
        messagingClient = new Twilio.IPMessaging.Client(accessManager);

        // Get the general chat channel
        print('Attempting to join "General" chat channel...');
        var promise = messagingClient.getChannelByUniqueName('General');
        promise.then(function (channel) {
            if (!channel) {
                // If it doesn't exist, let's create it
                messagingClient.createChannel({
                    uniqueName: 'General',
                    friendlyName: 'General Chat Channel'
                }).then(function (channel) {
                    activeChannel = channel;
                    console.log('Created General channel:', activeChannel);
                    addRow(activeChannel.uniqueName);
                    setupChannel(activeChannel);
                }).catch(function (e) {
                    console.log('There was a problem creating the general channel', e)
                });
            } else {
                activeChannel = channel;
                console.log('Found General channel:', activeChannel);
                addRow(activeChannel.uniqueName);
                setupChannel(activeChannel);
            }

            // Listen for additions to new channels
            messagingClient.on('channelAdded', function (channel) {
                addRow(channel.uniqueName);
            });
        }).catch(function (e) {
            console.log("An error while joining the general channel", e)
        });
    });

    // Set up the active channel when selected
    function setupChannel(selectedChannel) {
        // Join the selected channel
        selectedChannel.join().then(function (channel) {
            print('<b>Joined channel as '
                + '<span class="me">' + username + '</span></b>.', true);
        }).catch(function (e) {
            console.log("An error while joining the selected channel", e)
        });

        // Get the last ten messages for the selected channel and print them
        selectedChannel.getMessages(10).then(function (messages) {
            for (var i = 0; i < messages.length; i++) {
                if (messages[i].author !== undefined) {
                    console.log("Messages", messages[i].author, messages[i].body);
                    printMessage(messages[i].author, messages[i].body);
                }
            }
        }).catch(function (e) {
            console.log("An error while getting the message history", e)
        });

        // Refresh and get the list of channels user is subscribed to
        messagingClient.getChannels().then(function (channels) {
            for (var i = 0; i < channels.length; i++) {
                if (channels[i].uniqueName !== undefined) {
                    var elementExists = document.getElementById(channels[i].uniqueName);
                    if (elementExists == null) {
                        addRow(channels[i].uniqueName)
                    }
                }
            }
        }).catch(function (e) {
            console.log("An error while getting the list of channels", e)
        });

        // Listen for new messages sent to the channel
        selectedChannel.on('messageAdded', function (message) {
            printMessage(message.author, message.body);
        });
    }

    // Make a selected channel active, destroy binds to the old channel
    function changeChannel(e) {
        if (e.target !== e.currentTarget && e.target.getAttribute('id') != null && e.target.getAttribute('id') != activeChannel.uniqueName) {
            $("#messages").empty();
            $('.channel').each(function () {
                $(this).attr('disabled', 'disabled');
                setTimeout(enableButton, 1000);
            });
            activeChannel.removeAllListeners('messageAdded');
            activeChannel.leave().then(function (oldChannel) {
                    messagingClient.getChannelByUniqueName(String(e.target.getAttribute('id'))).then(function (channel) {
                        activeChannel = channel;
                        setupChannel(activeChannel);
                        console.log("Active Channel is now: " + e.target.getAttribute('id'));
                    }).catch(function (e) {
                        console.log("An error while getting the new channel", e)
                    });
                }
            ).catch(function (e) {
                console.log("An error while leaving channel", e)
            });
        }

        e.stopPropagation();
    }

    // Delete all the channels
    function deleteAllChannels(e) {
        $.post('/ipm_channel_delete_all');
        e.stopPropagation();
    }

    // Send a new message to the general channel and call the outbound SMS function
    var $input = $('#chat-input');
    $input.on('keydown', function (e) {
        if (e.keyCode == 13) {
            activeChannel.sendMessage($input.val());
            if (activeChannel.uniqueName != "General") {
                $.post('/outbound_message', {
                    message: $input.val(),
                    phone_number: activeChannel.uniqueName
                });
            }
            $input.val('');
        }
    });

    // Controls for deleting all channels
    var deleteAllListener = document.querySelector("#delete-all");
    deleteAllListener.addEventListener("click", deleteAllChannels, false);

    // Listen for clicks to switch channels
    var switchListener = document.querySelector("#channels");
    switchListener.addEventListener("click", changeChannel, false);

});
