define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'popover',
  'models/media',
  'text!templates/media_item_image.html'

], function($, 
			_, 
			Backbone, 
			Handlebars,
			Popover, 
			MediaItem, 
			ImageTemplate
){
  var MediaItemView = Backbone.View.extend({
  
	initialize: function(args) {
		this.on('renderEvent', this.afterRender);
		this.listenTo(this.model, 'change', this.render);
	},
	
	imageTemplate: Handlebars.compile(ImageTemplate),

    
	tagName: 'div',
    
	events: {
		'submit .editor': 'editModel',
		'click .delete' : 'deleteModel',
		'click .media-item .content' : 'changeSelected',
		'change .selected' : 'selectModel',
		'click .makethumbnail' : 'makeThumbnail',
	},
	
    render: function(){
      this.$el.html(this.renderItem());
      this.trigger('renderEvent');
      return this;
    },
    
    afterRender: function() {
    	this.$el.find('.edit').popover();
    	this.$el.find('.edit').on('click', function(e) {e.preventDefault(); return true;});
    	this.trigger('ready');
    	return this;
    },
    
    editModel: function(e) {
    	e.preventDefault();
    	this.model.set({
    		title: $(e.currentTarget).find('.title-input').val(),
    		description: $(e.currentTarget).find('.description-input').val()
    	});
    	this.model.save();
    	return this;
    },
    
    deleteModel: function(e) {
    	e.preventDefault();
    	if (confirm('Are you sure you want to delete '+this.model.get('title'))) {
    		var that = this;
    		this.model.destroy({
    			success: function(data) {
    				that.$el.remove();
    			},
			    error : function (data) {
			        //console.log('error' + data);
			    }
    		});
    		return this;
        }
    },
    
    renderItem: function() {
    	html = '';
    	var renderObj = {model: this.model.attributes, selectable: this.model.selectable()};
    	switch(this.model.get('type')) {
	      case 'images':
	    	  html = this.imageTemplate(renderObj);
	    	  break;
    		}
    	this.trigger('mediaready');
    	return html;
    },
    
    changeSelected : function(e) {
    	//var that = this;
    	var checkbox = $(e.currentTarget).prev().find('input[name=mediaSelected]');
    	
    	if ($(checkbox).is(':checked')) {
    		$(checkbox).prop('checked', false).trigger('change');
    	} else {
    		$(checkbox).prop('checked', true).trigger('change');
    	}
    }, 
    
    selectModel: function(e) {
    	var that = this;
    	if($(e.currentTarget).is(':checked')) {
    		that.model.set('selected', true);
    		var event = new CustomEvent('mediaBrowserMediaSelected', {'detail': that.model});
    		document.dispatchEvent(event);
    	} else {
    		that.model.set('selected', false);
    		Backbone.trigger('removeSelected', that);
    		var event = new CustomEvent('mediaBrowserMediaUnSelected', {'detail': that.model});
    		document.dispatchEvent(event);
    	}
    	return this;
    },
    
    makeThumbnail: function(e) {
    	e.preventDefault();
    	Backbone.trigger('mediaThumbSelect', {model: this.model});
    	var event = new CustomEvent('mediaBrowserThumbSelect', {'detail': this.model});
		document.dispatchEvent(event);
    }
  	
  });
  
  return MediaItemView;
});