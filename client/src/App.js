import React from "react";
import './App.css';
import unmuteIcon from './assets/unmute_icon.svg'

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {addedClips: [], clips: [], currentClip: "https://production.assets.clips.twitchcdn.net/41827822749-offset-21738.mp4", noClips: false};
    this.nextClip = this.nextClip.bind(this);
  }

  async fetchClips() {
    fetch("http://localhost:9000/")
        .then(res => res.json())
        .then(data => {
          let clips = []
          data.forEach(function(clip){
            clips.push(clip);
          })
          this.setState({clips: [...clips], addedClips: [...clips]});

          if (clips.length === 0){
              this.setState({noClips: true});
          } else {
              this.nextClip();
          }
        })
        .catch(err => err);
  }

  updateList(){
      fetch("http://localhost:9000/")
          .then(res => res.json())
          .then(data => {
              let newClips = [...data]
              for (let i = 0; i < newClips.length; i++){
                  if (!this.state.addedClips.includes(newClips[i])){
                      let clips = [...this.state.clips];
                      clips.push(newClips[i]);

                      let addedClips = [...this.state.addedClips];
                      addedClips.push(newClips[i]);

                      this.setState({
                          clips: clips,
                          addedClips: addedClips
                      });
                  }
              }

              if (this.state.noClips){
                  this.setState({noClips: false})
                  this.nextClip();
              }
          })
          .catch(err => err);
  }

    nextClip(){
      if (this.state.clips.length > 0){
          document.querySelector('.videoClip').style.display = 'block'
          let updatedArray = [...this.state.clips];
          let currentClip = updatedArray.shift();
          this.setState({
              currentClip: currentClip,
              clips: updatedArray
          })
      } else {
          document.querySelector('.videoClip').style.display = 'none'
          this.setState({noClips: true})
      }
    }

  componentDidMount() {
    this.fetchClips().catch(err => err);
    document.querySelector(".videoClip").onended = function() {
          this.nextClip();
      }.bind(this);

    let updateInterval = setInterval(this.updateList.bind(this), 60000)
    this.setState({updateInterval: updateInterval});

    document.querySelector(".unmuteButton").addEventListener("click", function(){
        const video = document.querySelector(".videoClip");
        video.volume = 0.5;
        video.muted = false;

        this.remove();
    });

      document.querySelector(".videoClip").onerror = function() {
          console.log('Error loading current clip, playing the next clip');
          this.nextClip();
      }.bind(this);
  }

  componentWillUnmount(){
      clearInterval(this.state.updateInterval);
  }

    render() {
    if (!this.state.clips) {
      return <span>Loading...</span>;
    }

    return (
        <div className="App">
            <p className="backText">
                Nothing clip worthy is happening right now :(
                <br />
                Videos will show up automatically, no need to F5
            </p>
            <video className="videoClip" src={this.state.currentClip} autoPlay={true} controls muted>

            </video>
            <button className="unmuteButton">
                <img className="unmute-icon" src={unmuteIcon}  alt="unmute" draggable="false"/>
            </button>
        </div>
    );
  }
}