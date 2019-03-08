# iSVG

#### Transforms short svg html notations into inline svg

Fallback possibility
Callback with detailed event object
General parameter settings: optimize, inheritClass, inheritId, fallbackFormat
Insertion methods: replace, before, after


HTML initial short
```
<img class="isvg logo" src="images/logo.svg">

//or

<div class="isvg logo" data-src="images/logo.svg"></div>

```

JS initial
```
$( document ).ready( onDoc );

function onDoc ( e ) {
    $.isvg( onISVG );
}

function onISVG ( e ) {
    console.log( "onISVG", e );
}

```

HTML result inline
```
<svg class="isvg logo" ... svg markup>
    <endles_xml_code>
</svg>

```
The initial element is replaced by the inline svg markup.
Id and class names are by default inherited.
When a svg is not found iSVG attempts to load a fallback image.
The fallback has to reside in the sme folder and have the same name.
The fallback suffix is by default "png" and can be changed.
In the above example "images/logo.svg" will be "images/logo.png".
The class name is then changed from "isvg" to "isvg-fallback".

HTML result fallback
```
<img class="isvg-fallback logo" src="images/logo.png">

```
If the fallback image is not found, iSVG only changes the class name of the initial element from "isvg" to "isvg-missing".

Job done. Everything inline. Callback event
```
function onISVG ( e ) {
    console.log( "onISVG", e );
}
/*
The log would look like this:

onISVG
  Object
    N amount: 1
    F callback: function(e)
    S event: "isvg"
    O fallback: r[] (0)
    S id: "1"
    O missing: r[] (0)
    O svg: r[<svg class="isvg logo">] (1)
    N toload: 0
    Object Prototype
*/

```
