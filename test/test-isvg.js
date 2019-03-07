/*
test-isvg.js
Designer: © Michael Schwarz, CyDot
Updated: 2019-03-07
*/


( function ( $ ) {
    
    function onDoc () { 
        
        $.isvg.inheritClass( false );
        $.isvg.inheritId( true );
        $.isvg.fallbackFormat( "png" );
        
        $.isvg( onISVG );
        
        $.isvg.replace( ".target", "test/cydot-logo.svg", onInsert );
        
        //$.isvg.before( ".target", "test/cydot-logo.svg", onInsert );
        
        //$.isvg.after( ".target", "test/cydot-logo.svg", onInsert );
    }
    
    function onISVG ( e ) {
        console.log( "onISVG", e );
    }
    
    function onInsert ( e ) {
        console.log( "onInsert", e );
    }
    
    // -----------------------------------------------
    
    $( document ).ready( onDoc );
    
})( jQuery );
