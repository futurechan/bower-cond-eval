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
		
		return (cond.constructor === Array)
			? evalArray(cond)
			: typeof cond  == "object" 
				? evalSingle(cond)
				: cond;
	}
}
},{"./helper":4,"./op":5}],4:[function(require,module,exports){
var op = require('./op')
	, compOps = [op.GT, op.GTE, op.LT, op.LTE, op.EQ, op.NEQ]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguYW5ndWxhci5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9saWIvZXZhbC5qcyIsInNyYy9saWIvaGVscGVyLmpzIiwic3JjL2xpYi9vcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG4vKiBnbG9iYWwgYW5ndWxhciAqL1xyXG5hbmd1bGFyLm1vZHVsZSgnY29uZC1ldmFsJywgW10pXHJcbiAgICAuc2VydmljZSgnY29uZGl0aW9uRXZhbHVhdG9yU2VydmljZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5ldmFsdWF0ZSA9IHJlcXVpcmUoJy4vaW5kZXgnKVxyXG4gICAgfSk7XHJcbiIsInZhciBFdmFsID0gcmVxdWlyZSgnLi9saWIvZXZhbCcpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGN0eCwgY29uZCl7XHJcblx0XHJcblx0dmFyIGV2YWwgPSBuZXcgRXZhbChjdHgpO1xyXG5cdFxyXG5cdHJldHVybiBldmFsLmV2YWx1YXRlKGNvbmQpO1xyXG59IiwidmFyIG9wID0gcmVxdWlyZSgnLi9vcCcpXHJcblx0LCBib29sT3BzID0gW29wLk5PVCwgb3AuWE9SLCBvcC5BTkQsIG9wLk9SXVxyXG5cdCwgaGVscGVyID0gcmVxdWlyZSgnLi9oZWxwZXInKVxyXG47XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGN0eCl7XHJcblx0XHJcblx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuXHRmdW5jdGlvbiBldmFsQXJyYXkoY29uZCl7XHJcblx0XHRib29sT3BzLmZvckVhY2goZnVuY3Rpb24ob3Ape1xyXG5cdFx0XHRjb25kID0gaGVscGVyLnJlZHVjZUFycmF5KGNvbmQsIG9wLCBzZWxmKTtcclxuXHRcdH0pXHJcblx0XHRcclxuXHRcdHJldHVybiBldmFsU2luZ2xlKGNvbmRbMF0pO1x0XHRcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGV2YWxTaW5nbGUoY29uZCl7XHJcblx0XHRpZihjb25kLnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBjb25kLnZhbHVlO1xyXG5cclxuXHRcdGlmKGNvbmQuY29uZGl0aW9ucyAmJiBjb25kLmNvbmRpdGlvbnMuY29uc3RydWN0b3IgPT09IEFycmF5KVxyXG5cdFx0XHRyZXR1cm4gZXZhbEFycmF5KGNvbmQuY29uZGl0aW9ucyk7XHJcblx0XHRcclxuXHRcdHZhciBsID0gaGVscGVyLmdldEZyb21DdHgoY29uZC5sZWZ0T3BlcmFuZCwgY3R4KSB8fCBjb25kLmxlZnRPcGVyYW5kO1xyXG5cdFx0dmFyIHIgPSBoZWxwZXIuZ2V0RnJvbUN0eChjb25kLnJpZ2h0T3BlcmFuZCwgY3R4KSB8fCBjb25kLnJpZ2h0T3BlcmFuZDtcclxuXHJcblx0XHR2YXIgb3AgPSBoZWxwZXIuZ2V0Q29tcGFyYXRvcihjb25kLmNvbXBhcmlzb24pO1xyXG5cclxuXHRcdHJldHVybiBvcC5ldmFsKGwsciwgc2VsZik7XHJcblx0fVxyXG5cclxuXHRzZWxmLmV2YWx1YXRlID0gZnVuY3Rpb24oY29uZCl7XHJcblx0XHRpZihjb25kLnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBjb25kLnZhbHVlO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gKGNvbmQuY29uc3RydWN0b3IgPT09IEFycmF5KVxyXG5cdFx0XHQ/IGV2YWxBcnJheShjb25kKVxyXG5cdFx0XHQ6IHR5cGVvZiBjb25kICA9PSBcIm9iamVjdFwiIFxyXG5cdFx0XHRcdD8gZXZhbFNpbmdsZShjb25kKVxyXG5cdFx0XHRcdDogY29uZDtcclxuXHR9XHJcbn0iLCJ2YXIgb3AgPSByZXF1aXJlKCcuL29wJylcclxuXHQsIGNvbXBPcHMgPSBbb3AuR1QsIG9wLkdURSwgb3AuTFQsIG9wLkxURSwgb3AuRVEsIG9wLk5FUV1cclxuO1xyXG5cclxubW9kdWxlLmV4cG9ydHMucmVkdWNlQXJyYXkgPSBmdW5jdGlvbihjb25kaXRpb25zLCBvcCwgZXZhbHVhdG9yKXtcclxuXHJcblx0dmFyIG91dHB1dCA9IFtdO1xyXG5cclxuXHR2YXIgY2Fycnk7XHJcblx0XHJcblx0Zm9yKHZhciBpPWNvbmRpdGlvbnMubGVuZ3RoLTE7IGk+PTA7IGktLSl7XHJcblx0XHRcclxuXHRcdGlmKCFjYXJyeSkgY2FycnkgPSBjb25kaXRpb25zW2ldO1xyXG5cdFx0XHJcblx0XHR2YXIgbCA9IChpID4gMCkgPyBjb25kaXRpb25zW2ktMV0gOiBudWxsO1xyXG5cdFx0XHJcblx0XHRpZighbCB8fCAhb3AubWF0Y2goY2FycnkuYm9vbCkpe1xyXG5cdFx0XHRvdXRwdXQucHVzaChjYXJyeSk7XHJcblx0XHRcdGNhcnJ5ID0gbnVsbDtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRjYXJyeSA9IHtcclxuXHRcdFx0XHRib29sOiBsLmJvb2wsXHJcblx0XHRcdFx0dmFsdWU6IG9wLmV2YWwobCwgY2FycnksIGV2YWx1YXRvcilcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIG91dHB1dC5yZXZlcnNlKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLmdldEZyb21DdHggPSBmdW5jdGlvbihmaWVsZCwgY3R4KXtcclxuXHRcclxuXHR2YXIgZmllbGRzID0gZmllbGQuc3BsaXQoJy4nKTtcclxuXHJcblx0ZmllbGRzLmZvckVhY2goZnVuY3Rpb24oZil7XHJcblx0XHRjdHggPSBjdHhbZl07XHJcblx0fSlcclxuXHJcblx0cmV0dXJuIGN0eDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuZ2V0Q29tcGFyYXRvciA9IGZ1bmN0aW9uKG9wKXtcclxuXHRmb3IodmFyIGk9MDsgaSA8IGNvbXBPcHMubGVuZ3RoOyBpKyspe1xyXG5cdFx0dmFyIGNvbXAgPSBjb21wT3BzW2ldO1xyXG5cclxuXHRcdGlmKGNvbXAubWF0Y2gob3ApKSByZXR1cm4gY29tcDtcclxuXHR9XHJcbn0iLCJcclxubW9kdWxlLmV4cG9ydHMuR1QgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdHVCcgfHwgb3AgPT0gJz4nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSA+IGV2YWx1YXRvci5ldmFsdWF0ZShyKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLkdURSA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0dURScgfHwgb3AgPT0gJz49JzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkgPj0gZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuTFQgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdMVCcgfHwgb3AgPT0gJzwnOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSA8IGV2YWx1YXRvci5ldmFsdWF0ZShyKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLkxURSA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0xURScgfHwgb3AgPT0gJzw9JzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkgPD0gZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuRVEgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdFUScgfHwgb3AgPT0gJz0nIHx8IG9wID09ICc9PSd8fCBvcCA9PSAnPT09JzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkgPT0gZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuTkVRID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnTkVRJyB8fCBvcCA9PSAnIT0nIHx8IG9wID09ICchPT0nfHwgb3AgPT0gJzw+JzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkgIT0gZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuTk9UID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnTk9UJyB8fCBvcCA9PSAnISc7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obiwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gIWV2YWx1YXRvci5ldmFsdWF0ZShuKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLlhPUiA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ1hPUicgfHwgb3AgPT0gJ14nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuICEhKGV2YWx1YXRvci5ldmFsdWF0ZShsKSBeIGV2YWx1YXRvci5ldmFsdWF0ZShyKSk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5BTkQgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdBTkQnIHx8IG9wID09ICcmJic7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpICYmIGV2YWx1YXRvci5ldmFsdWF0ZShyKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLk9SID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnT1InIHx8IG9wID09ICd8fCc7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpIHx8IGV2YWx1YXRvci5ldmFsdWF0ZShyKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLkNPTlRBSU5TID0ge1xyXG5cdG1hdGNoOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdDT05UQUlOUycgfHwgb3AgPT0gJ1tdJzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3Ipe1xyXG4gICAgICAgIHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkuaW5kZXhPZihldmFsdWF0b3IuZXZhbHVhdGUocikpID4gLTE7XHJcblx0fVxyXG59Il19
