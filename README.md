# Presentation

This repository is a template for scientific presentations based on [Reveal.js](https://revealjs.com/#/).

See the [demo here](https://labojeanperrin.github.io/Presentation/).

## General Usage

Clone or download the repository on your local machine and modify `index.html` according to your needs. Please read the [Reveal.js presentation page](https://github.com/hakimel/reveal.js/) for information on basic editing.

Any text editor should work for this, but [Brackets](http://brackets.io/) is a smart choice since it is designed for web applications and has convenient live preview capabilities.

## Content

This template has several plugins already activated:

- **Equations** with [Katex](https://github.com/Khan/KaTeX). Embed your LaTeX-syntaxed equations in `$...$` for inline equations and in `$$...$$` for page-wide equations.
- **Local camera stream** with [reveal-embed-video](https://github.com/ThomasWeinert/reveal-embed-video)
- **Animated svg** with [Snap.svg](http://snapsvg.io/).

Audio, video and iframes are natively supported by your browser (html5).

## Specific features

### Manage logos 

### Citations and bibliography


## Misc notes

- This template has been developped for the Laboratoire Jean Perrin but it can be easily adaptated to other laboratories or institutions. One just have to put its own logos in the `Media/Images/Logos` directory and change the logos tags in `index.html`:

```
<logo class='institution' src='Media/Images/Logos/SU_Sciences.png'></logo>
<logo class='institution' src='Media/Images/Logos/LJP.png'></logo>
<logo class='institution' src='Media/Images/Logos/CNRS.png'></logo>
```
