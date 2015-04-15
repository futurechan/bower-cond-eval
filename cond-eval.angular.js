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

        var l = helper.getFromCtx(cond.leftOperand, ctx) || cond.leftOperand;
        var r = helper.getFromCtx(cond.rightOperand, ctx) || cond.rightOperand;

        var op = helper.getComparator(cond.comparison);

        return op.eval(l,r, self);
	}

	self.evaluate = function(cond){
		if(cond.value !== undefined) return cond.value;

		if(cond.conditions && cond.conditions.constructor === Array)
            return evalArray(cond.conditions);

        if(cond.leftOperand && cond.rightOperand && cond.comparison)
            return evalSingle(cond)

        return cond;
	}
}
},{"./helper":4,"./op":5}],4:[function(require,module,exports){
var op = require('./op')
	, compOps = [op.GT, op.GTE, op.LT, op.LTE, op.EQ, op.NEQ, op.CONTAINS, op.NOT_CONTAINS]
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
        l = evaluator.evaluate(l);
        r = evaluator.evaluate(r)
        return l.indexOf(r) > -1;
	}
}

module.exports.NOT_CONTAINS = {
    match: function(op){ return op.toUpperCase() == 'NOT_CONTAINS' || op == '![]'; },
    eval: function(l, r, evaluator){
        l = evaluator.evaluate(l);
        r = evaluator.evaluate(r)
        return l.indexOf(r) == -1;
    }
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguYW5ndWxhci5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9saWIvZXZhbC5qcyIsInNyYy9saWIvaGVscGVyLmpzIiwic3JjL2xpYi9vcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcclxuLyogZ2xvYmFsIGFuZ3VsYXIgKi9cclxuYW5ndWxhci5tb2R1bGUoJ2NvbmQtZXZhbCcsIFtdKVxyXG4gICAgLnNlcnZpY2UoJ2NvbmRpdGlvbkV2YWx1YXRvclNlcnZpY2UnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMuZXZhbHVhdGUgPSByZXF1aXJlKCcuL2luZGV4JylcclxuICAgIH0pO1xyXG4iLCJ2YXIgRXZhbCA9IHJlcXVpcmUoJy4vbGliL2V2YWwnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjdHgsIGNvbmQpe1xyXG5cdFxyXG5cdHZhciBldmFsID0gbmV3IEV2YWwoY3R4KTtcclxuXHRcclxuXHRyZXR1cm4gZXZhbC5ldmFsdWF0ZShjb25kKTtcclxufSIsInZhciBvcCA9IHJlcXVpcmUoJy4vb3AnKVxyXG5cdCwgYm9vbE9wcyA9IFtvcC5OT1QsIG9wLlhPUiwgb3AuQU5ELCBvcC5PUl1cclxuXHQsIGhlbHBlciA9IHJlcXVpcmUoJy4vaGVscGVyJylcclxuO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjdHgpe1xyXG5cdFxyXG5cdHZhciBzZWxmID0gdGhpcztcclxuXHJcblx0ZnVuY3Rpb24gZXZhbEFycmF5KGNvbmQpe1xyXG5cdFx0Ym9vbE9wcy5mb3JFYWNoKGZ1bmN0aW9uKG9wKXtcclxuXHRcdFx0Y29uZCA9IGhlbHBlci5yZWR1Y2VBcnJheShjb25kLCBvcCwgc2VsZik7XHJcblx0XHR9KVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gZXZhbFNpbmdsZShjb25kWzBdKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGV2YWxTaW5nbGUoY29uZCl7XHJcblxyXG5cdFx0aWYoY29uZC52YWx1ZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gY29uZC52YWx1ZTtcclxuXHJcbiAgICAgICAgdmFyIGwgPSBoZWxwZXIuZ2V0RnJvbUN0eChjb25kLmxlZnRPcGVyYW5kLCBjdHgpIHx8IGNvbmQubGVmdE9wZXJhbmQ7XHJcbiAgICAgICAgdmFyIHIgPSBoZWxwZXIuZ2V0RnJvbUN0eChjb25kLnJpZ2h0T3BlcmFuZCwgY3R4KSB8fCBjb25kLnJpZ2h0T3BlcmFuZDtcclxuXHJcbiAgICAgICAgdmFyIG9wID0gaGVscGVyLmdldENvbXBhcmF0b3IoY29uZC5jb21wYXJpc29uKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG9wLmV2YWwobCxyLCBzZWxmKTtcclxuXHR9XHJcblxyXG5cdHNlbGYuZXZhbHVhdGUgPSBmdW5jdGlvbihjb25kKXtcclxuXHRcdGlmKGNvbmQudmFsdWUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGNvbmQudmFsdWU7XHJcblxyXG5cdFx0aWYoY29uZC5jb25kaXRpb25zICYmIGNvbmQuY29uZGl0aW9ucy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpXHJcbiAgICAgICAgICAgIHJldHVybiBldmFsQXJyYXkoY29uZC5jb25kaXRpb25zKTtcclxuXHJcbiAgICAgICAgaWYoY29uZC5sZWZ0T3BlcmFuZCAmJiBjb25kLnJpZ2h0T3BlcmFuZCAmJiBjb25kLmNvbXBhcmlzb24pXHJcbiAgICAgICAgICAgIHJldHVybiBldmFsU2luZ2xlKGNvbmQpXHJcblxyXG4gICAgICAgIHJldHVybiBjb25kO1xyXG5cdH1cclxufSIsInZhciBvcCA9IHJlcXVpcmUoJy4vb3AnKVxyXG5cdCwgY29tcE9wcyA9IFtvcC5HVCwgb3AuR1RFLCBvcC5MVCwgb3AuTFRFLCBvcC5FUSwgb3AuTkVRLCBvcC5DT05UQUlOUywgb3AuTk9UX0NPTlRBSU5TXVxyXG47XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5yZWR1Y2VBcnJheSA9IGZ1bmN0aW9uKGNvbmRpdGlvbnMsIG9wLCBldmFsdWF0b3Ipe1xyXG5cclxuXHR2YXIgb3V0cHV0ID0gW107XHJcblxyXG5cdHZhciBjYXJyeTtcclxuXHRcclxuXHRmb3IodmFyIGk9Y29uZGl0aW9ucy5sZW5ndGgtMTsgaT49MDsgaS0tKXtcclxuXHRcdFxyXG5cdFx0aWYoIWNhcnJ5KSBjYXJyeSA9IGNvbmRpdGlvbnNbaV07XHJcblx0XHRcclxuXHRcdHZhciBsID0gKGkgPiAwKSA/IGNvbmRpdGlvbnNbaS0xXSA6IG51bGw7XHJcblx0XHRcclxuXHRcdGlmKCFsIHx8ICFvcC5tYXRjaChjYXJyeS5ib29sKSl7XHJcblx0XHRcdG91dHB1dC5wdXNoKGNhcnJ5KTtcclxuXHRcdFx0Y2FycnkgPSBudWxsO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGNhcnJ5ID0ge1xyXG5cdFx0XHRcdGJvb2w6IGwuYm9vbCxcclxuXHRcdFx0XHR2YWx1ZTogb3AuZXZhbChsLCBjYXJyeSwgZXZhbHVhdG9yKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gb3V0cHV0LnJldmVyc2UoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuZ2V0RnJvbUN0eCA9IGZ1bmN0aW9uKGZpZWxkLCBjdHgpe1xyXG5cdFxyXG5cdHZhciBmaWVsZHMgPSBmaWVsZC5zcGxpdCgnLicpO1xyXG5cclxuXHRmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihmKXtcclxuXHRcdGN0eCA9IGN0eFtmXTtcclxuXHR9KVxyXG5cclxuXHRyZXR1cm4gY3R4O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5nZXRDb21wYXJhdG9yID0gZnVuY3Rpb24ob3Ape1xyXG5cdGZvcih2YXIgaT0wOyBpIDwgY29tcE9wcy5sZW5ndGg7IGkrKyl7XHJcblx0XHR2YXIgY29tcCA9IGNvbXBPcHNbaV07XHJcblxyXG5cdFx0aWYoY29tcC5tYXRjaChvcCkpIHJldHVybiBjb21wO1xyXG5cdH1cclxufSIsIlxyXG5tb2R1bGUuZXhwb3J0cy5HVCA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0dUJyB8fCBvcCA9PSAnPic7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpID4gZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuR1RFID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnR1RFJyB8fCBvcCA9PSAnPj0nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSA+PSBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5MVCA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0xUJyB8fCBvcCA9PSAnPCc7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGwpIDwgZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuTFRFID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnTFRFJyB8fCBvcCA9PSAnPD0nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSA8PSBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5FUSA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0VRJyB8fCBvcCA9PSAnPScgfHwgb3AgPT0gJz09J3x8IG9wID09ICc9PT0nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSA9PSBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5ORVEgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdORVEnIHx8IG9wID09ICchPScgfHwgb3AgPT0gJyE9PSd8fCBvcCA9PSAnPD4nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcikge1xyXG5cdFx0cmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShsKSAhPSBldmFsdWF0b3IuZXZhbHVhdGUocik7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5OT1QgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdOT1QnIHx8IG9wID09ICchJzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihuLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiAhZXZhbHVhdG9yLmV2YWx1YXRlKG4pO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuWE9SID0ge1xyXG5cdG1hdGNoIDogZnVuY3Rpb24ob3ApeyByZXR1cm4gb3AudG9VcHBlckNhc2UoKSA9PSAnWE9SJyB8fCBvcCA9PSAnXic7IH0sXHJcblx0ZXZhbDogZnVuY3Rpb24obCwgciwgZXZhbHVhdG9yKSB7XHJcblx0XHRyZXR1cm4gISEoZXZhbHVhdG9yLmV2YWx1YXRlKGwpIF4gZXZhbHVhdG9yLmV2YWx1YXRlKHIpKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLkFORCA9IHtcclxuXHRtYXRjaCA6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0FORCcgfHwgb3AgPT0gJyYmJzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkgJiYgZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuT1IgPSB7XHJcblx0bWF0Y2ggOiBmdW5jdGlvbihvcCl7IHJldHVybiBvcC50b1VwcGVyQ2FzZSgpID09ICdPUicgfHwgb3AgPT0gJ3x8JzsgfSxcclxuXHRldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3IpIHtcclxuXHRcdHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUobCkgfHwgZXZhbHVhdG9yLmV2YWx1YXRlKHIpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuQ09OVEFJTlMgPSB7XHJcblx0bWF0Y2g6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ0NPTlRBSU5TJyB8fCBvcCA9PSAnW10nOyB9LFxyXG5cdGV2YWw6IGZ1bmN0aW9uKGwsIHIsIGV2YWx1YXRvcil7XHJcbiAgICAgICAgbCA9IGV2YWx1YXRvci5ldmFsdWF0ZShsKTtcclxuICAgICAgICByID0gZXZhbHVhdG9yLmV2YWx1YXRlKHIpXHJcbiAgICAgICAgcmV0dXJuIGwuaW5kZXhPZihyKSA+IC0xO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuTk9UX0NPTlRBSU5TID0ge1xyXG4gICAgbWF0Y2g6IGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wLnRvVXBwZXJDYXNlKCkgPT0gJ05PVF9DT05UQUlOUycgfHwgb3AgPT0gJyFbXSc7IH0sXHJcbiAgICBldmFsOiBmdW5jdGlvbihsLCByLCBldmFsdWF0b3Ipe1xyXG4gICAgICAgIGwgPSBldmFsdWF0b3IuZXZhbHVhdGUobCk7XHJcbiAgICAgICAgciA9IGV2YWx1YXRvci5ldmFsdWF0ZShyKVxyXG4gICAgICAgIHJldHVybiBsLmluZGV4T2YocikgPT0gLTE7XHJcbiAgICB9XHJcbn0iXX0=
