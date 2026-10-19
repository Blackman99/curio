<p align="center"><img src="assets/logo.svg" alt="Curio" width="140"></p>

# Curio

*A cabinet of AI curiosities.*

A growing collection of small, interactive web experiments that make ideas from AI and machine learning visible and playable. Each piece is a self-contained page that runs entirely in your browser, with no backend and no tracking. Some are explanatory toys, others are generative art; all of them are honest about what is simulated.

**Walk the archive:** https://blackman99.github.io/curio/

The homepage is a museum you can walk around in: the newest exhibit stands under the rotunda's oculus and every earlier one has a case of its own in the galleries around it. Walk with W A S D (or the arrow keys, the scroll wheel, or the left thumb on a phone), drag to look, click the floor to go there, and click a case to open the exhibit. The floor plan and directory in the corner take you to any case; `?list` gives a plain list instead.

## Run locally

Everything is static. Serve the repo root with any HTTP server:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

## License

[MIT](LICENSE) © Blackman99
