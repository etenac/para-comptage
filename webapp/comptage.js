var comptage = (function (document, window) {
    
    'use strict';

    // Listening to key stroke inthe reason field
    document.getElementById('reason').addEventListener('keyup', function(e) {
        reason = this.innerHTML ;
    });
    // Preventing the tab closing
    window.onbeforeunload = function() { return false};

    var tickFrequencyInMs = 1000;
    var timer;
    var pause = true;
    
    var timeInSec = 0;  // current call
    var totalTimeInSec = 0;
    var averageTimeInSec = 0;
    var minTimeInSec = 3600; // 1 hour 
    var maxTimeInSec = 0;
    var reason = "";
    
    var nbCall = 0;
    var calls = [];
    
    // Zero padding helper function:
    var zeroPad = function(i) {
        return (i < 10 ? '0' : '') + i;
    };
    
    // Time formatting helper function
    var formatTime = function(sec){
        var hours = Math.floor(sec / 3600);
        var minutes = Math.floor((sec % 3600) / 60);
        var seconds = Math.floor((sec % 3600) % 60);
        
        return zeroPad(hours) + 'h ' + zeroPad(minutes) + 'm ' + zeroPad(seconds) + 's';
    }
    
    // Appelé à chaque tour, comptage des secondes
    var tick = function() {
        timeInSec += tickFrequencyInMs/1000;
        document.getElementById('timer').firstChild.nodeValue = formatTime(timeInSec);
    };
    
    // Démarrage du timer
    var start = function() {
        timer = window.setInterval(tick, tickFrequencyInMs);
        pause = false;
    };
    
    // Arret avec comptage de l'appel
    var stop = function() {
        var currentTime = timeInSec + 1; // une seconde de cloture, pour conclure celle en court
        clearTimer(); // fin de timer
        
        var date = new Date();
        calls.push({"date":date.getTime(), "duration":currentTime, "reason": reason});
        nbCall++;
        totalTimeInSec += currentTime;
        averageTimeInSec = totalTimeInSec / nbCall;
        minTimeInSec = Math.min(currentTime, minTimeInSec);
        maxTimeInSec = Math.max(currentTime, maxTimeInSec);
        
        updateView();
    };
          
    // Cloture de l'appel, avec ou sans traitement
    var clearTimer = function() {
        clearInterval(timer);
        timeInSec = 0; // reinit
        pause = true;
        document.getElementById('timer').firstChild.nodeValue = formatTime(timeInSec);
        try {
            document.getElementById('reason').firstChild.nodeValue = "";
        } catch (e) {
            // On accepte que ce soit null (si pas de saisie)
        }
    }
    
    // Maj des indicateurs
    var updateView = function() {
        document.getElementById('nbCall').firstChild.nodeValue = nbCall;
        document.getElementById('totalTimeInSec').firstChild.nodeValue = formatTime(totalTimeInSec);
        document.getElementById('averageTimeInSec').firstChild.nodeValue = formatTime(averageTimeInSec);
        document.getElementById('minTimeInSec').firstChild.nodeValue = formatTime(minTimeInSec);
        document.getElementById('maxTimeInSec').firstChild.nodeValue = formatTime(maxTimeInSec);
    };
    
    // en fonction de l'état inter, démarrage ou cloture d'appel
    var toggle = function() {
        pause ? start() : stop();
    };
    
    var send = function() {
        
        var stats= {
            "day": (new Date()).toLocaleDateString("fr-FR"),
            "nbCall": nbCall,
            "totalTimeInSec": totalTimeInSec,
            "averageTimeInSec": averageTimeInSec,
            "minTimeInSec": minTimeInSec,
            "maxTimeInSec": maxTimeInSec,
            "calls": calls
        };
        
        // Construction de la table
        var table = stats.day + "\n" ;
        var nodes = document.getElementsByTagName("td");
        for (var i = 0; i < nodes.length ; i++) {
            table += nodes[i].firstChild.nodeValue;
            if (i % 2 === 1) {
                table += "\n";
            }
        }
        
        // CSV pour aller vite
        var csv = stats.day + ";" + stats.nbCall + ";" + stats.totalTimeInSec + ";" +
            stats.averageTimeInSec + ";" + stats.minTimeInSec + ";" + stats.maxTimeInSec + ";" ;
        
        //  Contenu complet + data en json
        var body = table + "\n\n" + csv + "\n\n" + JSON.stringify(stats);
        
        document.location.href = "mailto:emmanuel.canet@gmail.com"
            + "?subject="+ encodeURIComponent("[EFPLB] Stats appel" + stats.day)
            + "&body=" + encodeURIComponent(body);
    };
    
    return {
        toggle: toggle,
        discard: clearTimer,
        send: send,
    };

})(document, window);