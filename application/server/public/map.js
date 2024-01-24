const scriptElement = document.createElement("script");
scriptElement.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDeOH7JuAUe3glWpRSgtTDUpj0Xye069Qo&callback=initMap";
scriptElement.setAttribute("async", true);
document.head.appendChild(scriptElement);

let position = {lat: 32.8426, lng: -117.2577 }; //default position

function initMap() {
    const mapContainer = MapWidget.mapContainer;
    const mapOptions = MapWidget.mapOptions;

    if (mapContainer && mapOptions) {
        const map = new google.maps.Map(mapContainer, mapOptions);

        const marker = new google.maps.Marker({
            map: map,
            position: mapOptions.center,
        });
    }
}

class MapWidget extends HTMLElement {
    static mapContainer;
    static mapOptions;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });

        MapWidget.mapContainer = document.createElement("div");
        MapWidget.mapContainer.style.height = "400px";
        MapWidget.mapContainer.style.width = "80%";
        shadow.appendChild(MapWidget.mapContainer);

        MapWidget.mapOptions = {
            center: position,
            zoom: 12,
        };
    }
}

customElements.define("map-widget", MapWidget);
