import { INITIAL_BOUNDS } from '@consts';
import mapboxgl from 'mapbox-gl';
import extentIcon from '@/assets/bug-favicon.png';

export class CustomNavigationControl extends mapboxgl.NavigationControl {
  private _fitExtentButton: HTMLButtonElement | null = null;
  private _bounds: mapboxgl.LngLatBounds;

  constructor(
    options?: ConstructorParameters<typeof mapboxgl.NavigationControl>[0],
    bounds: mapboxgl.LngLatBounds = INITIAL_BOUNDS
  ) {
    super(options);
    this._bounds = bounds;
    this._fitToExtent = this._fitToExtent.bind(this);
  }

  onAdd(map: mapboxgl.Map): HTMLElement {
    const container = super.onAdd(map);

    this._fitExtentButton = document.createElement('button');
    this._fitExtentButton.className =
      'mapboxgl-ctrl-icon mapboxgl-ctrl-fit-extent';
    this._fitExtentButton.type = 'button';
    this._fitExtentButton.title = 'Fit to initial extent';
    this._fitExtentButton.setAttribute('aria-label', 'Fit to initial extent');

    const img = document.createElement('img');
    img.src = extentIcon;
    img.alt = 'Fit to extent';
    img.style.cssText =
      'width: 20px; height: 20px; pointer-events: none; margin: auto';
    this._fitExtentButton.appendChild(img);

    this._fitExtentButton.addEventListener('click', this._fitToExtent);

    container.insertBefore(this._fitExtentButton, container.firstChild);
    this._injectStyles();

    return container;
  }

  onRemove(): void {
    this._fitExtentButton?.removeEventListener('click', this._fitToExtent);
    this._fitExtentButton = null;
    super.onRemove();
  }

  private _fitToExtent(): void {
    this._map?.fitBounds(this._bounds, {
      padding: 40,
      duration: 1200,
      easing: (t) => t * (2 - t),
    });
  }

  private _injectStyles(): void {
    const id = 'mapboxgl-ctrl-fit-extent-styles';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .mapboxgl-ctrl-fit-extent {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mapboxgl-ctrl-fit-extent img {
        pointer-events: none;
        opacity: 0.7;
        transition: opacity 0.15s ease;
      }
      .mapboxgl-ctrl-fit-extent:hover img {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
}
