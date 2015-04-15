(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/* global angular */
angular.module('cond-eval', [])
    .service('conditionEvaluatorService', function(){
        this.evaluate = require('./index')
    });

},{"./index":2}],2:[function(require,module,exports){
var Eval = require('./lib/eval')

module.exports = function(ctx, cond){
	
	var eval = new Eval(ctx);
	
	return eval.evaluate(cond);
}
},{"./lib/eval":3}],3:[function(require,module,exports){
var op = require('./op')
	, boolOps = [op.NOT, op.XOR, op.AND, op.OR]
	, helper = require('./helper')
;

module.exports = function(ctx){
	
	var self = this;

	function evalArray(cond){
		boolOps.forEach(function(op){
			cond = helper.reduceArray(cond, op, self);
		})
		
		return evalSingle(cond[0]);		
	}

	function evalSingle(cond){
		if(cond.value !== undefined) return cond.value;

		if(cond.conditions && cond.conditions.constructor === Array)
			return evalArray(cond.conditions);
		
		var l = helper.getFromCtx(cond.leftOperand, ctx) || cond.leftOperand;
		var r = helper.getFromCtx(cond.rightOperand, ctx) || cond.rightOperand;

		var op = helper.getComparator(cond.comparison);

		return op.eval(l,r, self);
	}

	self.evaluate = function(cond){
		if(cond.value !== undefined) return cond.value;
		
		return typeof cond  == "object"
				? evalSingle(cond)
				: cond;
	}
}
},{"./helper":4,"./op":5}],4:[function(require,module,exports){
var op = require('./op')
	, compOps = [op.GT, op.GTE, op.LT, op.LTE, op.EQ, op.NEQ, op.CONTAINS]
;

module.exports.reduceArray = function(conditions, op, evaluator){

	var output = [];

	var carry;
	
	for(var i=conditions.length-1; i>=0; i--){
		
		if(!carry) carry = conditions[i];
		
		var l = (i > 0) ? conditions[i-1] : null;
		
		if(!l || !op.match(carry.bool)){
			output.push(carry);
			carry = null;
		}else{
			carry = {
				bool: l.bool,
				value: op.eval(l, carry, evaluator)
			}
		}
	}

	return output.reverse();
}

module.exports.getFromCtx = function(field, ctx){
	
	var fields = field.split('.');

	fields.forEach(function(f){
		ctx = ctx[f];
	})

	return ctx;
}

module.exports.getComparator = function(op){
	for(var i=0; i < compOps.length; i++){
		var comp = compOps[i];

		if(comp.match(op)) return comp;
	}
}
},{"./op":5}],5:[function(require,module,exports){

module.exports.GT = {
	match : function(op){ return op.toUpperCase() == 'GT' || op == '>'; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) > evaluator.evaluate(r);
	}
}

module.exports.GTE = {
	match : function(op){ return op.toUpperCase() == 'GTE' || op == '>='; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) >= evaluator.evaluate(r);
	}
}

module.exports.LT = {
	match : function(op){ return op.toUpperCase() == 'LT' || op == '<'; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) < evaluator.evaluate(r);
	}
}

module.exports.LTE = {
	match : function(op){ return op.toUpperCase() == 'LTE' || op == '<='; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) <= evaluator.evaluate(r);
	}
}

module.exports.EQ = {
	match : function(op){ return op.toUpperCase() == 'EQ' || op == '=' || op == '=='|| op == '==='; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) == evaluator.evaluate(r);
	}
}

module.exports.NEQ = {
	match : function(op){ return op.toUpperCase() == 'NEQ' || op == '!=' || op == '!=='|| op == '<>'; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) != evaluator.evaluate(r);
	}
}

module.exports.NOT = {
	match : function(op){ return op.toUpperCase() == 'NOT' || op == '!'; },
	eval: function(n, evaluator) {
		return !evaluator.evaluate(n);
	}
}

module.exports.XOR = {
	match : function(op){ return op.toUpperCase() == 'XOR' || op == '^'; },
	eval: function(l, r, evaluator) {
		return !!(evaluator.evaluate(l) ^ evaluator.evaluate(r));
	}
}

module.exports.AND = {
	match : function(op){ return op.toUpperCase() == 'AND' || op == '&&'; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) && evaluator.evaluate(r);
	}
}

module.exports.OR = {
	match : function(op){ return op.toUpperCase() == 'OR' || op == '||'; },
	eval: function(l, r, evaluator) {
		return evaluator.evaluate(l) || evaluator.evaluate(r);
	}
}

module.exports.CONTAINS = {
	match: function(op){ return op.toUpperCase() == 'CONTAINS' || op == '[]'; },
	eval: function(l, r, evaluator){
        return evaluator.evaluate(l).indexOf(evaluator.evaluate(r)) > -1;
	}
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguYW5ndWxhci5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9saWIvZXZhbC5qcyIsInNyYy9saWIvaGVscGVyLmpzIiwic3JjL2xpYi9vcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXHJcbi8qIGdsb2JhbCBhbmd1bGFyICovXHJcbmFuZ3VsYXIubW9kdWxlKCdjb25kLWV2YWwnLCBbXSlcclxuICAgIC5zZXJ2aWNlKCdjb25kaXRpb25FdmFsdWF0b3JTZXJ2aWNlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmV2YWx1YXRlID0gcmVxdWlyZSgnLi9pbmRleCcpXHJcbiAgICB9KTtcclxuIiwidmFyIEV2YWwgPSByZXF1aXJlKCcuL2xpYi9ldmFsJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3R4LCBjb25kKXtcclxuXHRcclxuXHR2YXIgZXZhbCA9IG5ldyBFdmFsKGN0eCk7XHJcblx0XHJcblx0cmV0dXJuIGV2YWwuZXZhbHVhdGUoY29uZCk7XHJcbn0iLCJ2YXIgb3AgPSByZXF1aXJlKCcuL29wJylcclxuXHQsIGJvb2xPcHMgPSBbb3AuTk9ULCBvcC5YT1IsIG9wLkFORCwgb3AuT1JdXHJcblx0LCBoZWxwZXIgPSByZXF1aXJlKCcuL2hlbHBlcicpXHJcbjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3R4KXtcclxuXHRcclxuXHR2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG5cdGZ1bmN0aW9uIGV2YWxBcnJheShjb25kKXtcclxuXHRcdGJvb2xPcHMuZm9yRWFjaChmdW5jdGlvbihvcCl7XHJcblx0XHRcdGNvbmQgPSBoZWxwZXIucmVkdWNlQXJyYXkoY29uZCwgb3AsIHNlbGYpO1xyXG5cdFx0fSlcclxuXHRcdFxyXG5cdFx0cmV0dXJuIGV2YWxTaW5nbGUoY29uZFswXSk7XHRcdFxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZXZhbFNpbmdsZShjb25kKXtcclxuXHRcdGlmKGNvbmQudmFsdWUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGNvbmQudmFsdWU7XHJcblxyXG5cdFx0aWYoY29uZC5jb25kaXRpb25zICYmIGNvbmQuY29uZGl0aW9ucy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpXHJcblx0XHRcdHJldHVybiBldmFsQXJyYXkoY29uZC5jb25kaXRpb25zKTtcclxuXHRcdFxyXG5cdFx0dmFyIGwgPSBoZWxwZXIuZ2V0RnJvbUN0eChjb25kLmxlZnRPcGVyYW5kLCBjdHgpIHx8IGNvbmQubGVmdE9wZXJhbmQ7XHJcblx0XHR2YXIgciA9IGhlbHBlci5nZXRGcm9tQ3R4KGNvbmQucmlnaHRPcGVyYW5kLCBjdHgpIHx8IGNvbmQucmlnaHRPcGVyYW5kO1xyXG5cclxuXHRcdHZhciBvcCA9IGhlbHBlci5nZXRDb21wYXJhdG9yKGNvbmQuY29tcGFyaXNvbik7XHJcblxyXG5cdFx0cmV0dXJuIG9wLmV2YWwobCxyLCBzZWxmKTtcclxuXHR9XHJcblxyXG5cdHNlbGYuZXZhbHVhdGUgPSBmdW5jdGlvbihjb25kKXtcclxuXHRcdGlmKGNvbmQudmFsdWUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGNvbmQudmFsdWU7XHJcblx0XHRcclxuXHRcdHJldHVybiB0eXBlb2YgY29uZCAgPT0gXCJvYmplY3RcIlxyXG5cdFx0XHRcdD8gZXZhbFNpbmdsZShjb25kKVxyXG5cdFx0XHRcdDogY29uZDtcclxuXHR9XHJcbn0iLCJ2YXIgb3AgPSByZXF1aXJlKCcuL29wJylcclxuXHQsIGNvbXBPcHMgPSBbb3AuR1QsIG9wLkdURSwgb3AuTFQsIG9wLkxURSwgb3AuRVEsIG9wLk5FUSwgb3AuQ09OVEFJTlNdXHJcbjtcclxuXHJcbm1vZHVsZS5leHBvcnRzLnJlZHVjZUFycmF5ID0gZnVuY3Rpb24oY29uZGl0aW9ucywgb3AsIGV2YWx1YXRvcil7XHJcblxyXG5cdHZhciBvdXRwdXQgPSBbXTtcclxuXHJcblx0dmFyIGNhcnJ5O1xyXG5cdFxyXG5cdGZvcih2YXIgaT1jb25kaXRpb25zLmxlbmd0aC0xOyBpPj0wOyBpLS0pe1xyXG5cdFx0XHJcblx0XHRpZighY2FycnkpIGNhcnJ5ID0gY29uZGl0aW9uc1tpXTtcclxuXHRcdFxyXG5cdFx0dmFyIGwgPSAoaSA+IDApID8gY29uZGl0aW9uc1tpLTFdIDogbnVsbDtcclxuXHRcdFxyXG5cdFx0aWYoIWwgfHwgIW9wLm1hdGNoKGNhcnJ5LmJvb2wpKXtcclxuXHRcdFx0b3V0cHV0LnB1c2goY2FycnkpO1xyXG5cdFx0XHRjYXJyeSA9IG51bGw7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0Y2FycnkgPSB7XHJcblx0XHRcdFx0Ym9vbDogbC5ib29sLFxyXG5cdFx0XHRcdHZhbHVlOiBvcC5ldmFsKGwsIGNhcnJ5LCBldmFsdWF0b3IpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiBvdXRwdXQucmV2ZXJzZSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5nZXRGcm9tQ3R4ID0gZnVuY3Rpb24oZmllbGQsIGN0eCl7XHJcblx0XHJcblx0dmFyIGZpZWxkcyA9IGZpZWxkLnNwbGl0KCcuJyk7XHJcblxyXG5cdGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKGYpe1xyXG5cdFx0Y3R4ID0gY3R4W2ZdO1xyXG5cdH0pXHJcblxyXG5cdHJldHVybiBjdHg7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLmdldENvbXBhcmF0b3IgPSBmdW5jdGlvbihvcCl7XHJcblx0Zm9yKHZhciBpPTA7IGkgPCBjb21wT3BzLmxlbmd0aDsgaSsrKXtcclxuXHRcdHZhciBjb21wID0gY29tcE9wc1tpXTtcclxuXHJcblx0XHRpZihjb21wLm1hdGNoKG9wKSkgcmV0dXJuIGNvbXA7XHJcblx0fVxyXG59IiwiXHJcbm1vZHVsZS5leHBvcnRzLkdUID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnR1QnIHx8IG9wID09ICc+JzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkgPiBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5HVEUgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdHVEUnIHx8IG9wID09ICc+PSc7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpID49IGV2YWx1YXRvci5ldmFsdWF0ZShyKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLkxUID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnTFQnIHx8IG9wID09ICc8JzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkgPCBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5MVEUgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdMVEUnIHx8IG9wID09ICc8PSc7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpIDw9IGV2YWx1YXRvci5ldmFsdWF0ZShyKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLkVRID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnRVEnIHx8IG9wID09ICc9JyB8fCBvcCA9PSAnPT0nfHwgb3AgPT0gJz09PSc7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpID09IGV2YWx1YXRvci5ldmFsdWF0ZShyKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLk5FUSA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ05FUScgfHwgb3AgPT0gJyE9JyB8fCBvcCA9PSAnIT09J3x8IG9wID09ICc8Pic7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpICE9IGV2YWx1YXRvci5ldmFsdWF0ZShyKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLk5PVCA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ05PVCcgfHwgb3AgPT0gJyEnOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKG4sIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuICFldmFsdWF0b3IuZXZhbHVhdGUobik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5YT1IgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdYT1InIHx8IG9wID09ICdeJzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiAhIShldmFsdWF0b3IuZXZhbHVhdGUobCkgXiBldmFsdWF0b3IuZXZhbHVhdGUocikpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuQU5EID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnQU5EJyB8fCBvcCA9PSAnJiYnOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSAmJiBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5PUiA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ09SJyB8fCBvcCA9PSAnfHwnOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSB8fCBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5DT05UQUlOUyA9IHtcclxuXHRtYXRjaDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnQ09OVEFJTlMnIHx8IG9wID09ICdbXSc7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKXtcclxuICAgICAgICByZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpLmluZGV4T2YoZXZhbHVhdG9yLmV2YWx1YXRlKHIpKSA+IC0xO1xyXG5cdH1cclxufSJdfQ==
