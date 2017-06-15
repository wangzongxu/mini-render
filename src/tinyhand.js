;(function(name, factory){
    var root = typeof window === 'object'
               ? window 
               : global;

    if (typeof root.define === 'function') {
        define(factory)
    } else if (typeof root.module === 'object' && module.exports) {
        module.exports = factory()
    } else {
        root[name] = factory()
    }
}('tinyHand', function() {
    class TinyHand {
        construtor() {

        }
        render() {
            console.log(arguments)
        }
    }
    return new TinyHand
}))