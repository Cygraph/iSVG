/*
Plugin: $.inlineSVG
Dependencies: jquery-3.x.x.js
Globals: none
Designer: © Michael Schwarz, CyDot
Version: 0.25.1
Updated: 2018-02-22

Log:

0.25.0:  Deleted var ids and fn notifySVGID
0.25.1: Class convention
*/

( function ( $ ) {
	
	var version = "0.25.0",
	
	cssClass = {
		inline: "svg-inline",
		fallback: "svg-fallback",
		error: "svg-error"
	},
	
	_event = {
		hasSvg: true,
		success: false,
		
		selected: "jQObject",
		inline: "jQObject",
		fallback: "jQObject",
		outage: "jQObject"
	},
	
	event,
    uniqueNr = 0;
	
	// Browser SVG detection and declaration ----------------------
	
	if ( window.Modernizr ) _event.hasSvg = Modernizr.svg;
	
	else if ( document.implementation.hasFeature
	( "http://www.w3.org/TR/SVG11/feature#Image", "1.1" )) {
		document.documentElement.className = "svg";
		_event.hasSvg = true;
	}
	else {
		document.documentElement.className = "no-svg";
		_event.hasSvg = false;
	};
	
	// Main method --------------------------------------------------

	$.inlineSVG = function ( callback ) {
		
		newEvent();
		emendProps();
		selectElements();
		
		if ( ! event.selected.length) _triggerCallback();
		else {
			if ( event.hasSvg ) _replaceBySVG();
			else _fallbackToImg();
		};
	};
	
	// Public Getter ---------------------------------------------------
	
	$.inlineSVG.version = version; // String
	$.inlineSVG.hasSvg = true;
	
	// Public Getter & Setter -----------------------------------------
	
	$.inlineSVG.byClass = false;
	$.inlineSVG.optimize = true;
    $.inlineSVG.hideErrors = true;
	
	$.inlineSVG.fallback = undefined; // String: Image suffix or source
	$.inlineSVG.callback = undefined; // Function
	
	// Private Methods -----------------------------------------------
	
	function newEvent () {
		event = {};
		var value;
		
		for ( var p in _event ) {
			if ( _event.hasOwnProperty( p )) {
				value = _event[ p ];
				if ( value === "jQObject" ) event[ p ] = $();
				else event[ p ] = value;
			};
		};
	};
	
	function emendProps () {
		$.inlineSVG.hasSvg = _event.hasSvg;
		$.inlineSVG.fallback = $.trim( $.inlineSVG.fallback );
        if ( $.inlineSVG.callback && typeof $.inlineSVG.callback !== "function" ) {
            $.inlineSVG.callback = undefined;
        };
	};
	
	function selectElements () {
        var $imgs = $( "img[src$='.svg']" ),
        $divs = $( "div[data-svg$='.svg']" );
        
		if ( $.inlineSVG.byClass === true ) {
			$imgs = $imgs.filter( "img." + cssClass.inline );
            $divs = $divs.filter( "div." + cssClass.inline );
		};
        
        $imgs.each( function ( index ) {
            $( this ).data( "svg", $( this ).attr( "src" ));
        });
        
        event.selected = $imgs.add( $divs );
	};
	
	function _replaceBySVG () {
		var queue = event.selected.length, svg;
        
        event.success = true;
		
		event.selected.each( function ( index ) {
			var $el = $( this ),
			xhr = $.get( $el.data( "svg" ), function (){}, "xml" );
			
			xhr.done( function ( xmlData ) {
				$svg = $( xmlData ).find( "svg" );
				
                if ( $svg ){
                    _copyAttributes( $el, $svg );
                    
                    if ( ! $svg.hasClass( cssClass.inline )) {
                        $svg.addClass( cssClass.inline );
                    };
                    if ( $.inlineSVG.optimize ) _optimizeSVG( $svg );
                    
				    $el.replaceWith( $svg ).remove();
                    event.inline = event.inline.add( $svg );
                }
                else _handleFallback.call( $el );
                
                if ( ! -- queue ) _triggerCallback();
			});
			
			xhr.fail( function ( response ) {
				_handleFallback.call( $el );
                if ( ! -- queue ) _triggerCallback();
			});
		});
	};
    
    function _nextAttempt () {
		$.inlineSVG();
	};
	
	function _fallbackToImg () {
		event.selected.each( _handleFallback );
		_triggerCallback();
	};
	
	// Bound to the info element ---------------------------------
	
	function _handleFallback () {
		var $el = $( this ), 
        tagName = this.nodeName.toLowerCase(),
        data = $.trim( $el.data( "fallback" ) || $.inlineSVG.fallback ),
        img, src, suffix;
        
        if ( $.inlineSVG.hideErrors ) $el.hide();
        event.success = false;
        
        if ( hasSuffix( data )) {
            suffix = data.slice( -3 );
            
            if ( data.length > 4 ) {
                src = data;
            }
            else if ( data.length === 3 ) {
                if ( suffix !== "svg" ) {
                    src = $el.data( "svg" ).slice( 0,  -3 ) + suffix;
                }
                else _handleOutage.call( $el );
            }
        }
        else _handleOutage.call( $el );
        
        if ( suffix === "svg" ) {
            if ( tagName === "div" ) {
                $el.data( "svg", src );
                $el.data( "fallback", "" );
            }
            else if ( tagName === "img" ) {
                $el.attr( "src", src );
                $el.data( "fallback", "" );
            };
            $( document ).on( "inlineSVG", _nextAttempt );
        }
        else {
            img = new Image();
            
            img.onload( _createFallback.bind( $el ));
            img.onerror( _handleOutage.bind( $el ));
            img.name = "fallbackImg" + ( ++ uniqueNr );
            img.src = src;
        };
    }
    
    function _createFallback ( event ) {
		var $el = $( this ), 
        $img = $( event.target ),
        tagName = this.nodeName.toLowerCase();
        
        _copyAttributes( $el, $img );
        $el.show().replaceWith( $img ).remove();
        
        $img.removeClass( cssClass.inline ).addClass( cssClass.fallback );
		event.fallback = event.fallback.add( $img );
	};
    
    function _handleOutage ( event ) {
		var $el = $( this ),
        tagName = this.nodeName.toLowerCase();
		
        if ( tagName === "img" ) $el.attr( "src", "" );
        else $el.removedData( "svg" );
        
		$el.addClass( cssClass.outage ).removeClass( cssClass.inline ).removeData( "fallback" );
		event.outage = event.outage.add( $el );
	};
	
	// Utils -------------------------------------------------------
	
	function _copyAttributes ( from, to ) {
		if ( from.attr( "id" )) to.attr( "id", from.attr( "id" ));
		to.attr( "class", from.attr( "class" ));
	};
    
    // Inline measures can result in blurred images at resizing in few browsers
	// Better use a stylesheet declaration for svg measures
	
	function _optimizeSVG ( svg ) {
		svg = $( svg )[ 0 ];
		svg.removeAttribute( "version" );
		svg.removeAttribute( "width" );
		svg.removeAttribute( "height" );
	};
    
    function hasSuffix ( strg ) {
        return !! ( imgSuffix( strg ) || svgSuffix( strg ));
    }
	
	function imgSuffix ( strg ) {
		return endsWith( strg, "png" ) || endsWith( strg, "jpg" ) || endsWith( strg, "gif" );
	};
    
    function svgSuffix ( strg ) {
		return endsWith( strg, "svg" );
	};
	
	function endsWith( strg, end ) {
        return strg.lastIndexOf( end ) === ( strg.length - end.length );
	};
	
	// Callback -------------------------------------------------------
	
	function _triggerCallback () {
		event.selected = event.inline.add( event.fallback ).add( event.outage );
		
		if ( $.inlineSVG.callback ) $.inlineSVG.callback.call( null, event );
		$( document ).trigger( "inlineSVG", event );
	};
    
    //$( document ).ready( $.inlineSVG );
    
}( jQuery ));
