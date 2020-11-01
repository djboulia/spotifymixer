
var TrackUtils = {

    shuffle : function (tracks) {
      let currentIndex = tracks.length,
        temporaryValue, randomIndex;
  
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
  
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
  
        // And swap it with the current element.
        temporaryValue = tracks[currentIndex];
        tracks[currentIndex] = tracks[randomIndex];
        tracks[randomIndex] = temporaryValue;
      }
  
      return tracks;
    },
  
    printTracks : function (tracks) {
  
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
  
        if (track) {
          const artists = track.track.artists;
          const name = track.track.name;
          const id = track.track.id;
  
          console.log("Track: " + i + " " + name + " [" + artists[0].name + "], id =" + id);
        } else {
          console.log("Track: " + i + " undefined!");
        }
  
      }
    },
  
    identicalTrackLists : function (tracks1, tracks2) {
  
      if (tracks1.length != tracks2.length) {
        console.log("Track list lengths aren't the same: " + tracks1.length + ", " + tracks2.length);
        return false;
      }
  
      for (let i = 0; i < tracks1.length; i++) {
        const track1 = tracks1[i];
        const track2 = tracks2[i];
  
        if (track1 && track2) {
          const name1 = track1.track.name;
          const id1 = track1.track.id;
  
          const name2 = track2.track.name;
          const id2 = track2.track.id;
  
          if (id1 != id2) {
            console.log("Track index " + i + " differs: " + name1 + " != " + name2);
            return false;
          }
  
        } else if (track1) {
          const name1 = track1.track.name;
  
          console.log("Track index: " + i + " differs: " + name1 + " != undefined");
          return false;
        } else if (track2) {
          const name2 = track2.track.name;
  
          console.log("Track index: " + i + " differs: undefined != " + name2);
          return false;
        } else {
          console.log("Track index: " + i + " both tracks undefined!");
          return false;
        }
      }
  
      return true;
    },
  
    findTrackIndex : function (track, tracks) {
  
      for (let i = 0; i < tracks.length; i++) {
        const current = tracks[i];
        if (current.track.id === track.track.id) {
          return i;
        }
      }
  
      console.log("ERROR! couldn't find track id!");
      return -1;
    },
  
    moveTrack : function (tracks, from, to) {
      tracks.splice(to, 0, tracks.splice(from, 1)[0]);
    }
  
  };
  
  module.exports = TrackUtils;