/*
* basic mutliview provides an interface to display multiple views which contain various elements.  
* clicking on a single trigger can display all the elements accociated with a view.
* Copyright 2019 Nicholas Freese
*/

var multiview = function(s){

	  var app = {

	      groupId: s.groupId,
	      views: s.views,

	      init: function(){

	      	var _this = this;
          _this.ensureCustomEvents();
	      	_this.initViews();
	      	_this.showDefault();

          window.addEventListener(_this.groupId + '-init-view', function(e){
              e = e || window.e;
              _this.getViewById(_this.currentView).switch({detail:_this.currentView});
          });

          return _this;

	      },

	      showDefault: function(){
	      	var _this = this;
          _this.hideAll();
          var foundToHide = false;
	      	for(var i = 0; i < _this.views.length; i++){
                if(typeof _this.views[i].s.default !== "undefined"){
                    if(_this.views[i].s.default === true){
                        if(typeof _this.views[i].show !== "undefined"){
                            _this.views[i].retreiveSwitch({detail: _this.views[i].s.viewId});
                            foundToHide = true;
                        }
                    }
                }
	      	}
          if(foundToHide === false){
          //_this.views[0].show();
          _this.views[0].retreiveSwitch({detail: _this.views[0].s.viewId});
          }

	      },

          initViews: function(){

          	var _this = this;
          	for(var i = 0; i < _this.views.length; i++){
                _this.initView(_this.views[i].viewId);
          	}

          },

          initView: function(viewId){
          	var _this = this;
          	var view = _this.getViewById(viewId);
          	buildView = {};
          	if(view !== false){
               buildView = {

                    s: view,

                    init: function(){
                    	var __this = this;
                      __this.loaded = false;
                      if(typeof __this.s.cache !== "undefined"){
                          __this.cache = __this.s.cache;
                      } else {
                          __this.cache = false;
                      }
                    	document.querySelector(__this.s.triggerTarget).onclick = function(e){
                          __this.retreiveSwitch(e);
                    	}

                    	return __this;
 
                    },

                    retreiveSwitch: function(e){

                      var __this = this;

                      e = e || window.e;
                        if(typeof __this.s.dataModel == "undefined"){
                            __this.switch({detail: __this.s.viewId});
                        } else {
                          
                            if(__this.loaded === false || __this.cache == false){
                                
                                window.addEventListener(__this.s.viewId + "show", __this.switch, false);
                                _this.makeRequest(__this.s.dataModel, __this.s.viewId, "show");
                                __this.loaded = true;

                            } else {
                                __this.switch({detail: __this.s.viewId});
                            }
                  
                        }

                    },

                    switch:function(e){
                          e = e || window.e;
                          var __this = _this.getViewById(e.detail);
                          _this.currentView = __this.s.viewId;
                          _this.hideAll();
                          __this.show();

                          var event = new CustomEvent(_this.groupId + '-switch', {detail: e.detail});
                          window.dispatchEvent(event);
                    },

                    show: function(){
                        var __this = this;
                            for(var e = 0; e < __this.s.viewTargets.length;e++){
                                document.querySelector(__this.s.viewTargets[e].target).style.display = __this.s.viewTargets[e].display || "block";
                            }
                    },
                    hide: function(){

                    	var __this = this;
                        for(var e = 0; e < __this.s.viewTargets.length;e++){
                            document.querySelector(__this.s.viewTargets[e].target).style.display = "none";
                        }

                    }


               };    
          	}

          	for(var i = 0; i < _this.views.length; i++){
          		if(_this.views[i].viewId == buildView.s.viewId){
                    _this.views[i] = buildView.init();
          		}
          	}
            var event = new CustomEvent(_this.groupId + '-init-view', {detail: viewId});
            window.dispatchEvent(event);
          },

          hideAll:function(){
          	var _this = this;
          	for(var i = 0; i < _this.views.length; i++){
                if(typeof _this.views[i].hide !== "undefined"){
                    _this.views[i].hide();
                }
          	}

          },

          getViewById: function(viewId){
          	var _this = this;
          	for(var i = 0; i < _this.views.length; i++){
                if(_this.views[i].viewId == viewId.toString() || _this.views[i].s.viewId == viewId.toString()){
                    return _this.views[i];
                }
          	}

          	return false;

          },

          makeRequest: function(requestParams, id, requestPurpose){
              var _this = this;
              if(typeof requestParams.beforeRequest !== "undefined"){
                  requestParams.beforeRequest(id, _this);
              }
              var xhttp = new XMLHttpRequest();
              xhttp.onreadystatechange = function() {
                  if (this.readyState == 4 && this.status == 200) {
                     requestParams.callback(xhttp.responseText, id, _this);
                     var event = new CustomEvent(id+requestPurpose, {detail: id});
                     window.dispatchEvent(event);
                     window.removeEventListener(id+requestPurpose, _this.getViewById(id).clickFunctionFromEvent, false);
                  }
              };
              xhttp.open(requestParams.type, requestParams.url, true);
              xhttp.send();
          },



          /*
          * utility
          */
          ensureCustomEvents: function(){
                    (function () {

                    if ( typeof window.CustomEvent === "function" ) return false;

                      function CustomEvent ( event, params ) {
                       params = params || { bubbles: false, cancelable: false, detail: undefined };
                        var evt = document.createEvent( 'CustomEvent' );
                        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
                        return evt;
                       }
        
                      CustomEvent.prototype = window.Event.prototype;

                      window.CustomEvent = CustomEvent;
                    })();
          }


	  }


	  return app.init();
};