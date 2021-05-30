
class Clipper{

    constructor() {

    }

    createClip(){

        return {created:true,data:{id: 'SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl'}};
    }

    getClip(){
        return {};
    }

    getVideoUrl(str){
        if (str === "MISS"){
            return {valid: false}
        } else{
            return {valid: true, url: "url"}
        }
    }
}

module.exports = Clipper;