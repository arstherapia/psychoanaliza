// Super 7 Responsive Image Slider
// Date: 11/13/2013
// Author: Seven
// Copyright: All rights reserved to Seven

(function($)
{
	//slider object
	var object;
	//interface for seven slider
	$.fn.superseven = function(options){
		 object=new superseven({
			 handle:$(this),
			 option:options
		 });	
		return object;
	};
   	//main class superseven
	function superseven(arg)
	{
		//global variable
		//slide handler
		var handle;
		//options
		var option;
		//timer handler for autoplay
		var timer;
		//autoplay flag
		var a_flag;
		//carousel flag
		var c_flag;
		//timer step
		var t_val;
		//slide indexes
		var current_index,target_index;
		//lock flag
		var lock;
		//mouse capture flag/touch
		var mpflag,tpflag;
		//swipe direction flag key
		var sd_flag;
		//mouse offset buffer
		var mp_temp,tp_temp,cr_temp;
		//thumbnail flag
		var t_flag;
		//original rate width vs height
		var rate;
		//overall slide length
		var length;
		//thumbnail width
		var thumb_width;
		//default parameters
		var defaults={
			//slider width
			width:				800,
			//slider height
			height:				300,
			//auto play
			autoplay:			false,
			//interval(second)
			interval:			5,
			//fullwidth mode
			fullwidth:			false,
			//responsive
			responsive:			true,
			//progressbar
			progressbar:		true,
			//progressbar type(linear/circle)
			progressbartype:	'circle',
			//caption type
			caption_type:		'fixed',
			//caption animation
			caption_animation:	0,
			//animation
			animation:			0,
			//bullet 
			bullet:				true,
			//carousel type
			carousel:			'horizontal',
			//repeat mode
			repeat_mode:		true,
			//skin type
			skin:				'default',
			//lightbox
			lightbox: 			false,
			//pause on hover 
			pause_on_hover:		true,
			//swipe mode
			swipe:				false,
			//keyboard mode
			keyboard:			false,
			//scroll mode
			scrollmode:			false,
			//custom event
			onanimstart:		function(){return false;},
			//custom event
			onanimend:			function(){return false;},
			//custom event
			onvideoplay: 		function(){return false;},
			//custom event
			onslidechange:		function(){return false;}
		};
		
		//slide handler
	  	handle=arg.handle;
	  	//option values
	  	option=$.extend({}, defaults, arg.option || {});
		//initialization
		seven_init();
		//seven initialization
		function seven_init()
		{
			var width=option.width,height=option.height;
			//variable initialization
			lock=t_val=0;
			current_index=target_index=0;
			mp_flag=tp_flag=t_flag=a_flag=sd_flag=c_flag=0;
			thumb_width=0;
			length=handle.find(".seven_slide").length;
			//setup the original rate
			rate=option.width/option.height;
			//carousel viewport initialization
			handle.find("#seven_viewport").prepend("<div id='seven_prev' class='seven_operate'></div><div id='seven_current' class='seven_operate seven_animate'></div><div id='seven_next' class='seven_operate seven_animate'></div>");
			handle.append("<div id='seven_lbox'></div>").append("<div class='seven_a_play'></div>");
			if(option.skin=='jumbo') handle.prepend('<img src="img/ribbon.png" style="position:absolute;left:-20px;top:-20px;z-index:100;"/>');
			else if(option.skin=='sapphire') handle.prepend('<div id="seven_sapphire_header"></div>');
			handle.find(".seven_slide").each(function(i)
			{
				var cache=$(this);
				var src=cache.attr("image-src");
				var caption=cache.attr("data-caption");
				var des=cache.attr("data-description");
				var video=cache.attr("video-src");
				var href=cache.attr("data-link");
				if(typeof(href)=='undefined') href="#";
				if(typeof(video)=='undefined') video="";
				cache.append("<img class='seven_image' src='"+src+"' data-src='"+video+"'/>");
				if(typeof(caption)!='undefined') cache.append("<div class='seven_caption'><div><a class='seven_title' href='"+href+"'>"+caption+"</a></div><div><a class='seven_des'>"+des+"</a></div></div>");
				if(video!="")
				{
					if(option.skin=='ios7')		cache.append("<img class='seven_play' src='img/skin/ios7_play.png'/>");
					else	cache.append("<img class='seven_play' src='img/skin/play.png'/>");
				}
				cache.find(".seven_image").load(function()
				{
					//image is fully loaded
					$(this).addClass("active");
				});
			});
			//functional initialization
	 		handle.css("width",width).css("height",height).attr("o-width",width).attr("o-height",height).attr("o-font",parseInt(handle.find(".seven_slide .seven_caption").css("font-size")));
			rate=width/height;
			//prepare image slide show
			seven_set_current_slide(current_index,0);
			//smooth framerate
			$().framerate(15);
		}
		//set prev/current/next slides
		function seven_set_current_slide(current,init_flag)
		{
			var prev=(current-1<0)?length-1:current-1;
			var next=(current+1)%length;
			var index=[prev,current,next];
			var name_arr=["#seven_prev","#seven_current","#seven_next"];
			handle.find(".seven_operate").each(function(i)
			{
				//lazy loading
				var cache=handle.find(name_arr[i]);
				var cache1=handle.find(".seven_slide:nth-child("+(index[i]+1)+")");
				cache.html(cache1.html());
				if(!cache1.find(".seven_image").hasClass("active"))
				{
					cache.prepend("<img class='seven_load' src='img/skin/"+option.skin+"_loader.gif' />");
					cache.find(".seven_image").load(function()
					{
						$(this).addClass("active");
						$(this).parent().find(".seven_load").remove();
						if(i==1&&init_flag==0)
							//start slider functions
							seven_setup();
					});
				}
			});	
			if(option.responsive)	seven_respond();
		}
		//set up the seven slide
		function seven_setup()
		{
			//skin setup
		    seven_skin_setup();			
			
			//setup for fullwidth
			if(option.fullwidth==true)
			{
				option.width = (window.innerWidth > screen.width) ? window.innerWidth : screen.width;
				handle.css("margin-left",0).css("width",option.width).css("height",option.height);
			}
			//setup for autoplay
			if(option.autoplay==true)
			{
				a_flag=1;
				seven_start();
			}
			else
			  	handle.find(".seven_a_play").addClass("seven_a_pause");
			//setup for progressbar
			if(option.progressbar==true)
			{
				if(seven_isIE()!=false&&seven_isIE()<9)	 option.progresstype='linear';
			    seven_progressbar_setup();
			}
			handle.find("#seven_hviewport").css("width",104*handle.find(".seven_slide").length);
			if(option.responsive==true)	seven_respond();
		}		
		//responsive screen
		function seven_respond()
		{
			var owidth=parseInt(handle.attr("o-width"));
			var rwidth=$(window).width();
			if(option.fullwidth)	
				option.width=rwidth;			
			else
			{
				if(rwidth>400&&rwidth<=owidth)
				{
					option.width=(option.skin=='sharp'||option.skin=='clean')?rwidth-20:rwidth-40;
				}
				else if(rwidth<400)
				{
					option.width=(option.fullwidth)?400:380;
				}
				else if(rwidth>owidth)	option.width=owidth;
			}
			/* vertical carousel */
			if(rwidth>option.width+180)
				handle.find(".seven_vcarousel").show();
			else
				handle.find(".seven_vcarousel").show();
			//carousel refresh
			seven_carousel_refresh();
			seven_lightbox_refresh();
			//set up the resized width/height
			var o_ftsize=handle.attr("o-font");
			var ratio=option.width/owidth;
			option.height=option.width/rate;
			font_size=(o_ftsize*ratio<10)?10:o_ftsize*ratio;
			handle.css("width",option.width).css("height",option.height);
			handle.find(".seven_caption").css("font-size",font_size);
			handle.find("#seven_sublightbox").css("width",option.width+8).css("height",option.height+8).css("marginLeft",(-option.width/2)-4).css("marginTop",-option.height/2);
			handle.find(".seven_operate").each(function(i)
			{
				var prev=(current_index-1<0)?length-1:current_index-1;
				var next=(current_index+1)%length;
				var index=[prev,current_index,next];
				var name_arr=["#seven_prev","#seven_current","#seven_next"];
				var temp=seven_get_imagesize(handle.find(".seven_slide:nth-child("+parseInt(index[i]+1)+")").find(".seven_image"));
				var temp_rate=temp.width/temp.height;
				if(rate>=temp_rate)
					handle.find(name_arr[i]).find(".seven_image").css("height","").css("width",option.width);
				else 
					handle.find(name_arr[i]).find(".seven_image").css("width","").css("height",option.height);
			});
		}
		//seven lightbox carousel refresh
		function seven_lightbox_refresh(flag)
		{
			var cache=handle.find("#seven_thumb_container");
			var board=handle.find("#seven_subboard");
			var width=cache.width();
			var left=Math.abs(parseInt(board.css("marginLeft")));
			var index=cache.find(".active").index();
			if(width<$(window).width()&&typeof(flag)!='undefined') return false;			
			if(flag==0)
			{
				if(left>index*54)
				{
					board.animate({"marginLeft":-54*index},{duration:200,easing:"easeOutSine"});
				}
				else if(width-$(window).width()-left<width-(length-index)*54)
				{
					var offset=-54*index;
					if(54*index+$(window).width()>width) offset=$(window).width()-width;
					board.animate({"marginLeft":offset},{duration:200,easing:"easeOutSine"});
				}
				if(index==length-1)
				{
					board.animate({"marginLeft":-width+$(window).width()},{duration:200,easing:"easeOutSine"});		
				}
			}
			else if(flag==1)
			{
				if(width-(length-index-1)*54-$(window).width()>left)
				{
					board.animate({"marginLeft":-(width-(length-index-1)*54-$(window).width())},{duration:200,easing:"easeOutSine"});
				}
				else if(!((index+1)*54-$(window).width()<left&&index*54>left))
				{
					var offset=$(window).width()-(index+1)*54;
					if(offset>0) offset=0;
					board.animate({"marginLeft":offset},{duration:200,easing:"easeOutSine"});
				}
				
				if(index==0)
				{
					board.animate({"marginLeft":0},{duration:200,easing:"easeOutSine"});
				}
			}
			if(typeof(flag)=='undefined')
			{
				if(width<$(window).width())
				{
					board.css("marginLeft",0);
				}
				else
				{
					if(54*index+$(window).width()<width)	board.show();					
					else board.css("marginLeft",-width+$(window).width());
				}
			}
		}
		//seven carousel refresh
		function seven_carousel_refresh()
		{
			//In case carousel overflows the board
			switch(option.carousel)
			{
				case 'horizontal':
					if(c_flag==1) return false;
					var width=handle.find("#seven_hviewport").width();
					var twidth=handle.find(".seven_hcarousel").width();
					var board=handle.find("#seven_hsubboard");
					if(width<twidth)
					{
						board.css("marginLeft",0);
					}
					else
					{
						if(104*current_index+twidth>width)	board.css("marginLeft",twidth-width);
						else board.css("marginLeft",-104*current_index);
					}
				break;
				case 'vertical':
					if(c_flag==1) return false;
					var height=handle.find("#seven_vviewport").height();
					var board=handle.find("#seven_vsubboard");
					if(height<option.height)
					{
						board.css("marginTop",0);
					}
					else
					{
						if(80*current_index+option.height>height)	board.css("marginTop",option.height-height);
						else board.css("marginTop",-80*current_index);
					}
				break;
			}
		}
		//get imageSize
		function seven_get_imagesize(src)
		{
			var arr=[];
			var hiddenImg = src.clone().css('visibility', 'hidden').removeAttr('height').removeAttr('width').appendTo('body');
			arr.width=hiddenImg.width();
			arr.height=hiddenImg.height();
			hiddenImg.remove();
			return arr;
		}
		//bullet initialization
		function seven_bullet_setup()
		{
			//add bullet to the div
			handle.append("<div class='seven_bullet_control'><div id='seven_bullet_viewport' class='seven_clearfix' align='center'><div id='seven_bullet_inner_viewport'></div></div></div>");
			//seven_thumbnail
			$("<div class='seven_bt_preview'><div class='seven_filter_bt'><div class='seven_bt_container'></div></div></div>").insertAfter(handle.find("#seven_bullet_viewport"));
			handle.find(".seven_slide").each(function(i)
			{
			  //Bullet
			  if(i==0)
				  handle.find("#seven_bullet_inner_viewport").append("<div class='seven_circle active'></div>");
			  else
				  handle.find("#seven_bullet_inner_viewport").append("<div class='seven_circle'></div>");
			  //Thumbnail
			  handle.find(".seven_bt_container").append("<div class='seven_bt_slide'><img class='seven_preview_img' src='"+$(this).find(".seven_image").attr("src")+"'/></div>");
			});
			//add > & || button
			handle.find("#seven_bullet_inner_viewport").append("<div class='seven_a_play' ></div>");
			//adjust width of the button container
			handle.find(".seven_bt_container").css("width",40*length);		  
		}
		//show carousels
		function seven_carousel_setup()
		{
			var tarray=[];
			tarray['default']=54;
			tarray['round']=119;
			tarray['jumbo']=119;
			tarray['science']=54;
			tarray['sapphire']=60;
			tarray['ios7']=60;
			switch(option.carousel)
			{
				case 'horizontal':
					//horizontal carousel bar
					handle.append("<div class='seven_hcarousel'><div id='seven_hsubboard'><div id='seven_hviewport'></div></div></div>");
					handle.find(".seven_slide").each(function(i)
					{
						  var src=$(this).find(".seven_image").attr("src");
						  if(i==0)
						  	handle.find("#seven_hviewport").append("<div class='carousel active'><div class='seven_ci'><img src='"+src+"'/></div></div>"); 
						  else
							handle.find("#seven_hviewport").append("<div class='carousel'><div class='seven_ci'><img src='"+src+"'/></div></div>"); 
					});
					thumb_width=tarray[option.skin];
				break;
				case 'vertical':
					//horizontal carousel bar
					handle.append("<div class='seven_vcarousel'><div id='seven_vsubboard'><div id='seven_vviewport'></div></div></div>");
					if(80*length<option.height) handle.find("#seven_vviewport").css("marginTop",-40*length);
					else handle.find("#seven_vviewport").css("top",0);
					handle.find(".seven_slide").each(function(i)
					{
						  var src=$(this).find(".seven_image").attr("src");
						  if(i==0)
						  	handle.find("#seven_vviewport").append("<div class='carousel active'><a class='seven_ci'><img src='"+src+"'/></a></div>"); 
						  else
							handle.find("#seven_vviewport").append("<div class='carousel'><a class='seven_ci'><img src='"+src+"'/></a></div>"); 
					});
				break;
			}
		}
		//set up the skin
		function seven_skin_setup()
		{
			  switch(option.skin)
			  {
				  case 'default':
					  if(option.bullet==null)	 option.bullet=true;
					  if(option.carousel==null)	option.carousel=false;
				  break;
				  case 'round':
					  if(option.bullet==null)  option.bullet=true;
					  if(option.carousel==null) option.carousel=false;
				  break;
				  case 'sharp':
					  if(option.bullet==null)	option.bullet=true;
					  if(option.carousel==null)  option.carousel=true;
				  break;
				  case 'clean':
					  if(option.bullet==null)	option.bullet=true;
					  if(option.carousel==null) option.carousel=false;
				  break;
				  case 'square':
					  if(option.bullet==null) option.bullet=true;
					  if(option.carousel==null) option.carousel=true;
				  break;
			  }
			  //initialization for bullet
			  if(option.bullet)
			  {
					seven_bullet_setup(handle);
					handle.find(".seven_hcarousel").addClass("seven_bullet");
			  }
			   
			  //initialization for carousel
			  if(option.carousel!=false)
			  {
				   seven_carousel_setup(option.carousel,handle);
			  }
			  
			  handle.addClass("seven_"+option.skin);
		}
		//initialize the progress bar
		function seven_progressbar_setup()
		{
			  if(a_flag==0) return false;
			  switch(option.progressbartype)
			  {
				  case 'linear':
				  		if(handle.find("#lp_ct").length==0)
							handle.find("#seven_viewport").prepend('<div id="lp_ct" class="progressbar"><div id="lprogress"></div></div>');
				  break;
				  case 'circle':
				  		if(handle.find("#cprogress").length==0)
							handle.find("#seven_viewport").prepend('<div id="cprogress" class="progressbar"><input class="knob cprogress" data-thinkness=".1" data-skin="tron" data-linecap="round" data-fgcolor="#333" data-width="40" data-displayInput=false value="0"></div>');
						//initialize the circular bar
						handle.find(".knob").knob({
							 draw : function () {
								 // "tron" case
								 if(this.$.data('skin') == 'tron') {
									  var a = this.angle(this.cv)  // Angle
									 , sa = this.startAngle          // Previous start angle
									 , sat = this.startAngle         // Start angle
									 , ea                            // Previous end angle
									 , eat = sat + a                 // End angle
									 , r = 1;
									 this.g.lineWidth = this.lineWidth;
									 this.o.cursor
										   && (sat = eat - 0.3)
										   && (eat = eat + 0.3);
									 if (this.o.displayPrevious) {
									   ea = this.startAngle + this.angle(this.v);
									   this.o.cursor
									   && (sa = ea - 0.3)
									   && (ea = ea + 0.3);
									   this.g.beginPath();
												this.g.strokeStyle = this.pColor;
												this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
												this.g.stroke();
										}
										this.g.beginPath();
										this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
										this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
										this.g.stroke();
										this.g.lineWidth = 2;
										this.g.beginPath();
										this.g.strokeStyle = this.o.fgColor;
										this.g.arc( this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
										this.g.stroke();
										return false;
								 }
							 }
						});
						 
				  break;
			  };
			  if(option.progress==false)
				handle.find(".progressbar").addClass("invisible");
		}
		//linear automate function
		function seven_linear_automate()
		{
		  t_val+=parseInt((option.width-10)/(20*option.interval));
		  if(t_val>=parseInt(option.width-10))
		  {
			  seven_next();
		  }
		  handle.find("#lprogress").css("width",t_val);	  
		}
		//circle automate function
		function seven_circle_automate()
		{
		   t_val+=5000/(option.interval*1000);
		   if(t_val>=100)
		   {
			   seven_stop();
			   seven_next();
		   }
		   handle.find('.cprogress').val(Math.ceil(t_val)).trigger('change');
		}
		//move to the previous slide
		function seven_current()
		{			
			c_flag=0;
			if(option.repeat_mode==false)
			{
			  if(current_index>0)
				seven_animation(current_index-1);
			  else
				seven_stop();
			}
			else
			{
				if(current_index==0) 
					seven_animation(length-1);
				else
					seven_animation(current_index-1);
			}
		}
		//move to the next slide
		function seven_next()
		{
			c_flag=0;
			if(option.repeat_mode==false)
			{
			  if(current_index<length-1)
				seven_animation(current_index+1);
			  else
				  seven_stop();
			}
			else
				seven_animation((current_index+1)%length);						
		}
		//move to prev carousel
		function seven_prev_carousel()
		{
			  if(100*length<option.width)	return false;
			  var tb=parseInt(option.width/160);
			  var temp=Math.abs(Math.ceil(parseInt(handle.find("#seven_hviewport").css("left"))/160));
			  if(temp>=tb)
			  {
				 handle.find("#seven_hviewport").animate({
					 "left":-100*(temp-tb),													 
				 },
				 {
					 duration:200,
					 easing:"swing"
				 });
			 }
			 else
			 {
				  handle.find("#seven_hviewport").animate({
					 "left":"0px",													 
				 },
				 {
					 duration:200,
					 easing:"swing"
				 });
			}	  
		}
		//move to next carousel
		function seven_next_carousel()
		{
			  if(100*length<option.width)	  return false;
			  var tb=parseInt(option.width/160);
			  var temp=Math.abs(Math.ceil(parseInt(handle.find("#seven_hviewport").css("left"))/160));
			  if(temp<(length-(tb*2)))
			  {
				 handle.find("#seven_hviewport").animate({
					 "left":-100*(temp+tb),													 
				 },
				 {
					 duration:400,
					 easing:"swing"
				 });
			 }
			 else
			 {
				  handle.find("#seven_hviewport").animate({
					 "left":-(handle.find("#seven_hviewport").width()-option.width)+"px",																			 		  
				  },
				  {
					 duration:400,
					 easing:"swing"
				  });
			 }
		}
		//preview slide on mousehover
		function seven_thumb_preview(arg){	  	
			var tleft=handle.find("#seven_bullet_inner_viewport").position().left;  
			var temp=parseInt(handle.find(".seven_circle").width())+2*parseInt(handle.find(".seven_circle").css("margin-left"));	  
			var tpad=parseInt(handle.find("#seven_bullet_inner_viewport").css("padding-left"));	
			handle.find('.seven_bt_preview').css("left",tleft);
			switch(t_flag)
			{
				  //When newly hover
				  case 0:
					  //calculate circle width including margin
					  handle.find('.seven_bt_preview').css("margin-left",tpad+arg*temp-27+temp/2);
					  handle.find('.seven_bt_container').css('margin-left',-40*arg);
					  handle.find(".seven_bt_preview").fadeIn(200);	
				  break;
				  //consequent hover
				  case 1:
					  //calculate circle width including margin
					  var temp=parseInt(handle.find(".seven_circle").width())+2*parseInt(handle.find(".seven_circle").css("margin-left"));
					  
					  handle.find('.seven_bt_preview').delay(50).animate({
								"margin-left":tpad+arg*temp-27+temp/2,
						   },
						   {
								duration:200,
								queue:false,
								easing:"easeOutSine"
						   });
						  handle.find('.seven_bt_container').animate({
								"margin-left":-40*arg,
						   },
						   {
								duration:200,
								queue:false,
								easing:"easeOutSine"
						   });
					  break;
			}
			//flag for thumbnail anim(switch to consequent hover from newly hover)
			if(t_flag==0)	 t_flag=1;
		}
		//hide preview slide on mouseout
		function seven_thumb_hide()
		{
			//thumbnail flag switch to newly hover
			t_flag=0;
			handle.find(".seven_bt_preview").hide();
		}
		//adjust carousel pos 
		function seven_adjust_carousel(arg)
		{
			switch(option.carousel)
			{
				case 'horizontal':
					var twidth=handle.find(".seven_hcarousel").width();
					if(c_flag==1)
					{					
						return false;
					}
					if(104*length<option.width) return false;
					var cache=handle.find("#seven_hsubboard");
					var board=handle.find("#seven_hviewport");
					var offset=104*target_index;
					if(offset+twidth>board.width())  offset=twidth-board.width();
					else offset=-104*target_index;
					cache.animate({"marginLeft":offset},{duration:200,easing:"easeOutSine"});
				break;
				case 'vertical':
					if(c_flag==1)
					{					
						return false;
					}
					if(80*length<option.height) return false;
					var cache=handle.find("#seven_vsubboard");
					var board=handle.find("#seven_vviewport");
					var offset=80*target_index;
					if(offset+option.height>board.height())  offset=option.height-board.height();
					else offset=-80*target_index;
					cache.animate({"marginTop":offset},{duration:200,easing:"easeOutSine"});
				break;
			}
			
		}
		//check if Browser is IE and return version No.
		function seven_isIE () {
			var myNav = navigator.userAgent.toLowerCase();
			return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
		}
		//random number generator
		function seven_rand_generator(limit)
		{
			var order=new Array(limit);
			for(var i=0;i<limit;i++)
			{
				  var temp;
				  var tflag=true;
				  while(tflag)
				  {
					  tflag=false;
					  temp=Math.floor((Math.random()*limit));
					  for(var j=0;j<i;j++)
					  {
						  if(order[j]==temp)
								tflag=true;  
					  }
				  }
				  order[i]=temp;
			}
			return order;
		}
		//animation function
		function seven_animation(arg)
		{
			//while animation is going on or same index
			if(lock==1||current_index==arg) return false;
			//main func
			lock=1;
			option.onanimstart();
			seven_stop();
			target_index=arg;
			var cache=handle.find("#seven_next");
			cache.html(handle.find(".seven_slide:nth-child("+(target_index+1)+")").html());
			if(!cache.find(".seven_image").hasClass("active"))
			{
				handle.find("#seven_current").prepend("<img class='seven_load' src='img/skin/"+option.skin+"_loader.gif' />");
				cache.find(".seven_image").load(function()
				{
					$(this).addClass("active");
					handle.find("#seven_current").find(".seven_load").remove();
					seven_animate_init();
				});
			}
			else	seven_animate_init();			
		}
		//animate initialization
		function seven_animate_init()
		{
			option.onslidechange();
			handle.find(".seven_video").remove();
			//resize the screen before animation
			seven_respond();			
			/* circle/carousel adjust */
			handle.find(".seven_circle").removeClass("active");
			handle.find(".carousel").removeClass("active");
			handle.find(".seven_circle:nth-child("+(target_index+1)+")").addClass("active");
			handle.find(".carousel:nth-child("+(target_index+1)+")").addClass("active");
			
			//adjust carousel Pos
			if(option.carousel!=false)	  seven_adjust_carousel(current_index);
			seven_caption_animate();
		}
		//caption animate
		function seven_caption_animate()
		{
			var anim_array=[[-1,0],[1,0],[0,-1],[0,1]];
			var a_code,caption;
			a_code=handle.find(".seven_slide:nth-child("+(target_index+1)+")").attr("data-animation");
			caption=handle.find(".seven_slide:nth-child("+(current_index+1)+")").attr("data-caption");
			if(typeof(a_code)=='undefined')
			{
				a_code=(option.animation==0)?(parseInt(Math.random()*351)+1):option.animation;
			}
			else
				a_code=parseInt(a_code);
			
			if(typeof(caption)=='undefined'||caption=='') 
			{
				//animation is done
				handle.find(".seven_caption").hide();
				if(a_code<=302) 
					seven_2d_animate(a_code);
				else
					seven_3d_animate(a_code-302);
			}
			else
			{
				//Initialization for Layer
				handle.find("#seven_current .seven_caption").css("marginLeft",0).css("marginBottom",0).animate({
					"marginLeft":anim_array[option.caption_animation][0]*140+"px",
					"marginBottom":anim_array[option.caption_animation][1]*60+"px",
					"opacity":0,
				},
				{
					duration:600,
					easing:"easeOutSine",
					complete: function()
					{	
						//animation is done
						handle.find(".seven_caption").hide();
						if(a_code<=302) 
							seven_2d_animate(a_code);
						else
							seven_3d_animate(a_code-302);
					}
				});		
			}
		}
		//caption animate emerge
		function seven_caption_end_animate()
		{
			var anim_array=[[-1,0],[1,0],[0,-1],[0,1]];
			var a_code;
			var opacity;
			//check if browser is ie
			if(seven_isIE()<9&&seven_isIE()!=false)
				opacity=0.4;
			else
				opacity=1;
			//Initialization for Layer
			caption=handle.find(".seven_slide:nth-child("+(current_index+1)+")").attr("data-caption");
			if(typeof(caption)=='undefined'||caption=='') 
			{
				//animation is done
				lock=0;
				option.onanimend();	
				if(option.responsive==true)	seven_respond();
				handle.find("#seven_next .seven_caption").stop();
				//if autoplay is on
				if(a_flag==1)	seven_start();
			}
			else
			{
				handle.find(".seven_caption").show();
				handle.find("#seven_current .seven_caption").css("marginLeft",anim_array[option.caption_animation][0]*140).css("marginBottom",anim_array[option.caption_animation][1]*60).css("opacity",0).animate({
					"marginLeft":"0px",
					"marginBottom":"0px",
					"opacity":opacity,
				},
				{
					duration:300,
					easing:"easeOutSine",
					complete: function()
					{	
						//animation is done
						lock=0;
						option.onanimend();	
						if(option.responsive==true)	seven_respond();
						handle.find("#seven_next .seven_caption").stop();
						//if autoplay is on
						if(a_flag==1)	seven_start();
					}
				});	
			}
		}
		//2d animation
		function seven_2d_animate(code)
		{
			switch(code)
			{
				case 1:
					seven_linear_move(0);
				break;
				case 2:
					seven_linear_move(1);
				break;
				case 3:
					seven_linear_move(2);
				break;
				case 4:
					seven_linear_move(3);
				break;
				case 5:
					seven_vbar_move(0);
				break;
				case 6:
					seven_vbar_move(1);
				break;
				case 7:
					seven_vbar_move(2);
				break;
				case 8:
					seven_vbar_move(3);
				break;
				case 9:
					seven_vbar_move(4);
				break;
				case 10:
					seven_vbar_move(5);
				break;
				case 11:
					seven_hbar_move(0);
				break;
				case 12:
					seven_hbar_move(1);
				break;
				case 13:
					seven_hbar_move(2);
				break;
				case 14:
					seven_hbar_move(3);
				break;
				case 15:
					seven_hbar_move(4);
				break;
				case 16:
					seven_hbar_move(5);
				break;
				case 17:
					seven_hbar_rmove(0);
				break;
				case 18:
					seven_hbar_rmove(1);
				break;
				case 19:
					seven_hbar_rmove(2);
				break;
				case 20:
					seven_hbar_rmove(3);
				break;
				case 21:
					seven_hbar_rmove(4);
				break;
				case 22:
					seven_hbar_rmove(5);
				break;
				case 23:
					seven_hbar_rmove(6);
				break;
				case 24:
					seven_hbar_rmove(7);
				break;
				case 25:
					seven_hbar_rmove(8);
				break;
				case 26:
					seven_hbar_rmove(9);
				break;
				case 27:
					seven_hbar_rmove(10);
				break;
				case 28:
					seven_hbar_rmove(11);
				break;
				case 29:
					seven_hbar_rmove(12);
				break;
				case 30:
					seven_hbar_rmove(13);
				break;
				case 31:
					seven_hbar_rmove(14);
				break;
				case 32:
					seven_hbar_rmove(15);
				break;
				case 33:
					seven_hbar_rmove(16);
				break;
				case 34:
					seven_hbar_rmove(17);
				break;
				case 35:
					seven_hbar_rmove(18);
				break;
				case 36:
					seven_hbar_rmove(19);
				break;
				case 37:
					seven_hbar_rmove(20);
				break;
				case 38:
					seven_hbar_rmove(21);
				break;
				case 39:
					seven_hbar_rmove(22);
				break;
				case 40:
					seven_hbar_rmove(23);
				break;
				case 41:
					seven_vbar_rmove(0);
				break;
				case 42:
					seven_vbar_rmove(1);
				break;
				case 43:
					seven_vbar_rmove(2);
				break;
				case 44:
					seven_vbar_rmove(3);
				break;
				case 45:
					seven_vbar_rmove(4);
				break;
				case 46:
					seven_vbar_rmove(5);
				break;
				case 47:
					seven_vbar_rmove(6);
				break;
				case 48:
					seven_vbar_rmove(7);
				break;
				case 49:
					seven_vbar_rmove(8);
				break;
				case 50:
					seven_vbar_rmove(9);
				break;
				case 51:
					seven_vbar_rmove(10);
				break;
				case 52:
					seven_vbar_rmove(11);
				break;
				case 53:
					seven_vbar_rmove(12);
				break;
				case 54:
					seven_vbar_rmove(13);
				break;
				case 55:
					seven_vbar_rmove(14);
				break;
				case 56:
					seven_vbar_rmove(15);
				break;
				case 57:
					seven_vbar_rmove(16);
				break;
				case 58:
					seven_vbar_rmove(17);
				break;
				case 59:
					seven_vbar_rmove(18);
				break;
				case 60:
					seven_vbar_rmove(19);
				break;
				case 61:
					seven_vbar_rmove(20);
				break;
				case 62:
					seven_vbar_rmove(21);
				break;
				case 63:
					seven_vbar_rmove(22);
				break;
				case 64:
					seven_vbar_rmove(23);
				break;
				case 65:
					seven_hcenter_stretch(0);
				break;
				case 66:
					seven_hcenter_stretch(1);
				break;
				case 67:
					seven_vcenter_stretch(0);
				break;
				case 68:
					seven_vcenter_stretch(1);
				break;
				case 69:
					seven_hbar_intersect(0);
				break;
				case 70:
					seven_hbar_intersect(1);
				break;
				case 71:
					seven_hbar_intersect(2);
				break;
				case 72:
					seven_hbar_intersect(3);
				break;
				case 73:
					seven_hbar_intersect(4);
				break;
				case 74:
					seven_hbar_intersect(5);
				break;
				case 75:
					seven_hbar_intersect(6);
				break;
				case 76:
					seven_hbar_intersect(7);
				break;
				case 77:
					seven_vbar_intersect(0);
				break;
				case 78:
					seven_vbar_intersect(1);
				break;
				case 79:
					seven_vbar_intersect(2);
				break;
				case 80:
					seven_vbar_intersect(3);
				break;
				case 81:
					seven_vbar_intersect(4);
				break;
				case 82:
					seven_vbar_intersect(5);
				break;
				case 83:
					seven_vbar_intersect(6);
				break;
				case 84:
					seven_vbar_intersect(7);
				break;
				case 85:
					seven_fade();
				break;
				case 86:
					seven_fade_overlap();
				break;
				case 87:
					seven_blind(0);
				break;
				case 88:
					seven_blind(1);
				break;
				case 89:
					seven_blind(2);
				break;
				case 90:
					seven_vblind(0);
				break;
				case 91:
					seven_vblind(1);
				break;
				case 92:
					seven_vblind(2);
				break;
				case 93:
					seven_blind_spread(0);
				break;	
				case 94:
					seven_blind_spread(1);
				break;
				case 95:
					seven_cut();
				break;
				case 96:
					seven_vcut(0);
				break;
				case 97:
					seven_vcut(1);
				break;
				case 98:
					seven_vcut(2);
				break;
				case 99:
					seven_vcut(3);
				break;
				case 100:
					seven_hcut(0);
				break;
				case 101:
					seven_hcut(1);
				break;
				case 102:
					seven_hcut(2);
				break;
				case 103:
					seven_hcut(3);
				break;
				case 104:
					seven_square(0);
				break;
				case 105:
					seven_square(1);
				break;
				case 106:
					seven_square(2);
				break;
				case 107:
					seven_square(3);
				break;
				case 108:
					seven_square(4);
				break;
				case 109:
					seven_square(5);
				break;
				case 110:
					seven_square(6);
				break;
				case 111:
					seven_square(7);
				break;
				case 112:
					seven_square_fade(0);
				break;
				case 113:
					seven_square_fade(1);
				break;
				case 114:
					seven_square_fade(2);
				break;
				case 115:
					seven_square_fade(3);
				break;
				case 116:
					seven_square_fade(4);
				break;
				case 117:
					seven_square_fade(5);
				break;
				case 118:
					seven_hsquare_fade(0);
				break;
				case 119:
					seven_hsquare_fade(1);
				break;
				case 120:
					seven_hsquare_fade(2);
				break;
				case 121:
					seven_hsquare_fade(3);
				break;
				case 122:
					seven_hsquare_fade(4);
				break;
				case 123:
					seven_hsquare_fade(5);
				break;
				case 124:
					seven_square_plazma(0);
				break;
				case 125:
					seven_square_plazma(1);
				break;
				case 126:
					seven_vsquare_plazma(0);
				break;
				case 127:
					seven_vsquare_plazma(1);
				break;
				case 128:
					seven_vsquare_plazma(2);
				break;
				case 129:
					seven_vsquare_plazma(3);
				break;
				case 130:
					seven_border_hide(0);
				break;
				case 131:
					seven_border_hide(1);
				break;
				case 132:
					seven_border_hide(2);
				break;
				case 133:
					seven_border_hide(3);
				break;
				case 134:
					seven_border_hide(4);
				break;
				case 135:
					seven_random_hide();
				break;
				case 136:
					seven_vplazma(0);
				break;
				case 137:
					seven_vplazma(1);
				break;
				case 138:
					seven_hplazma(0);
				break;
				case 139:
					seven_hplazma(1);
				break;
				case 140:
					seven_water();
				break;
				case 141:
					seven_water_inside();
				break;
				case 142:
					seven_water_rotate_cross();
				break;
				case 143:
					seven_circle_rotate(0);
				break;
				case 144:
					seven_circle_rotate(1);
				break;
				case 145:
					seven_swap_block();
				break;
				case 146:
					seven_swap_hblock(0);
				break;
				case 147:
					seven_swap_hblock(1);
				break;
				case 148:
					seven_swap_hblock(2);
				break;
				case 149:
					seven_swap_hblock(3);
				break;
				case 150:
					seven_swap_vblock(0);
				break;
				case 151:
					seven_swap_vblock(1);
				break;
				case 152:
					seven_swap_vblock(2);
				break;
				case 153:
					seven_swap_vblock(3);
				break;
				case 154:
					seven_tile_sequence(0);
				break;
				case 155:
					seven_tile_sequence(1);
				break;
				case 156:
					seven_tile_sequence(2);
				break;
				case 157:
					seven_tile_sequence(3);
				break;
				case 158:
					seven_tile_psequence(0);
				break;
				case 159:
					seven_tile_psequence(1);
				break;
				case 160:
					seven_tile_psequence(2);
				break;
				case 161:
					seven_tile_psequence(3);
				break;
				case 162:
					seven_tile_random_direct(0);
				break;
				case 163:
					seven_tile_random_direct(1);
				break;
				case 164:
					seven_tile_random_direct(2);
				break;
				case 165:
					seven_tile_random_direct(3);
				break;
				case 166:
					seven_htwist(0);
				break;
				case 167:
					seven_htwist(1);
				break;
				case 168:
					seven_vtwist(0);
				break;
				case 169:
					seven_vtwist(1);
				break;
				case 170:
					seven_chain(0);
				break;
				case 171:
					seven_chain(1);
				break;
				case 172:
					seven_schain(0);
				break;
				case 173:
					seven_schain(1);
				break;
				case 174:
					seven_tile_random();
				break;
				case 175:
					seven_fadezoomout();
				break;
				case 176:
					seven_fadezoomin();
				break;
				case 177:
					seven_htail(0);
				break;
				case 178:
					seven_htail(1);
				break;
				case 179:
					seven_htail(2);
				break;
				case 180:
					seven_htail(3);
				break;
				case 181:
					seven_htail(4);
				break;
				case 182:
					seven_htail(5);
				break;
				case 183:
					seven_htail(6);
				break;
				case 184:
					seven_htail(7);
				break;
				case 185:
					seven_vtail(0);
				break;
				case 186:
					seven_vtail(1);
				break;
				case 187:
					seven_vtail(2);
				break;
				case 188:
					seven_vtail(3);
				break;	
				case 189:
					seven_vtail(4);
				break;	
				case 190:
					seven_vtail(5);
				break;	
				case 191:
					seven_vtail(6);
				break;	
				case 192:
					seven_vtail(7);
				break;
				case 193:
					seven_fly(0);
				break;
				case 194:
					seven_fly(1);
				break;
				case 195:
					seven_fly(2);
				break;
				case 196:
					seven_fly(3);
				break;
				case 197:
					seven_rotate();
				break;
				case 198:
					seven_mirrow();
				break;
				case 199:
					seven_mirrow_drag();
				break;
				case 200:
					seven_vmirrow();
				break;
				case 201:
					seven_vmirrow_drag();
				break;
				case 202:
					seven_flipx(0);
				break;
				case 203:
					seven_flipx(1);
				break;
				case 204:
					seven_flipy(0);
				break;
				case 205:
					seven_flipy(1);
				break;
				case 206:
					seven_ropen(0);
				break;
				case 207:
					seven_ropen(1);
				break;
				case 208:
					seven_rvopen(0);
				break;
				case 209:
					seven_rvopen(1);
				break;
				case 210:
					seven_4sector(0);
				break;
				case 211:
					seven_4sector(1);
				break;
				case 212:
					seven_4sector(2);
				break;
				case 213:
					seven_4sector(3);
				break;
				case 214:
					seven_4sector(4);
				break;
				case 215:
					seven_4sector_fade(0);
				break;
				case 216:
					seven_4sector_fade(1);
				break;
				case 217:
					seven_4sector_fade(2);
				break;
				case 218:
					seven_4sector_fade(3);
				break;
				case 219:
					seven_4sector_fade(4);
				break;
				case 220:
					seven_page(0);
				break;
				case 221:
					seven_page(1);
				break;
				case 222:
					seven_page(2);
				break;
				case 223:
					seven_page(3);
				break;
				case 224:
					seven_page(4);
				break;
				case 225:
					seven_page(5);
				break;
				case 226:
					seven_page(6);
				break;
				case 227:
					seven_page(7);
				break;
				case 228:
					seven_carousel(0);
				break;
				case 229:
					seven_carousel(1);
				break;
				case 230:
					seven_carousel(2);
				break;
				case 231:
					seven_carousel(3);
				break;
				case 232:
					seven_carousel(4);
				break;
				case 233:
					seven_carousel(5);
				break;
				case 234:	
					seven_carousel(6);
				break;
				case 235:
					seven_carousel(7);
				break;
				case 236:
					seven_carousel(8);
				break;
				case 237:
					seven_emerge(0);
				break;
				case 238:
					seven_emerge(1);
				break;
				case 239:
					seven_emerge(2);
				break;
				case 240:
					seven_emerge(3);
				break;
				case 241:
					seven_emerge(4);
				break;
				case 242:
					seven_emerge(5);
				break;
				case 243:
					seven_emerge(6);
				break;
				case 244:
					seven_emerge(7);
				break;
				case 245:
					seven_emerge(8);
				break;
				case 246:
					seven_emerge(9);
				break;
				case 247:
					seven_emerge(10);
				break;
				case 248:
					seven_emerge(11);
				break;
				case 249:
					seven_fancy_rect(0);
				break;
				case 250:
					seven_fancy_rect(1);
				break;
				case 251:
					seven_fancy_rect(2);
				break;
				case 252:
					seven_fancy_rect(3);
				break;
				case 253:
					seven_fancy_rect(4);
				break;
				case 254:
					seven_fancy_rect(5);
				break;
				case 255:
					seven_fancy_rect(6);
				break;
				case 256:
					seven_fancy_rect(7);
				break;
				case 257:
					seven_fancy_rect(8);
				break;
				case 258:
					seven_fancy_rect(9);
				break;
				case 259:
					seven_fancy_rect_emerge(0);
				break;
				case 260:
					seven_fancy_rect_emerge(1);
				break;
				case 261:
					seven_fancy_rect_emerge(2);
				break;
				case 262:
					seven_fancy_rect_emerge(3);
				break;
				case 263:
					seven_fancy_rect_emerge(4);
				break;
				case 264:
					seven_fancy_rect_emerge(5);
				break;
				case 265:
					seven_fancy_rect_emerge(6);
				break;
				case 266:
					seven_fancy_rect_emerge(7);
				break;
				case 267:
					seven_fancy_rect_emerge(8);
				break;
				case 268:
					seven_fancy_rect_emerge(9);
				break;
				case 269:
					seven_door(0);
				break;
				case 270:
					seven_door(1);
				break;	
				case 271:
					seven_door(2);
				break;
				case 272:
					seven_door(3);
				break;
				case 273:
					seven_skew(0);
				break;
				case 274:
					seven_skew(1);
				break;
				case 275:
					seven_skew(2);
				break;
				case 276:
					seven_skew(3);
				break;
				case 277:
					seven_skew(4);
				break;
				case 278:
					seven_skew(5);
				break;
				case 279:
					seven_skew(6);
				break;
				case 280:
					seven_skew(7);
				break;
				case 281:
					seven_square_push(0);
				break;
				case 282:
					seven_square_push(1);
				break;
				case 283:
					seven_square_push(2);
				break;
				case 284:
					seven_square_push(3);
				break;
				case 285:
					seven_square_push(4);
				break;
				case 286:
					seven_square_push(5);
				break;
				case 287:
					seven_row_carousel(0);
				break;
				case 288:
					seven_row_carousel(1);
				break;
				case 289:
					seven_row_carousel(2);
				break;
				case 290:
					seven_row_carousel(3);
				break;
				case 291:
					seven_col_carousel(0);
				break;
				case 292:
					seven_col_carousel(1);
				break;
				case 293:
					seven_col_carousel(2);
				break;
				case 294:
					seven_col_carousel(3);
				break;
				case 295:
					seven_hbar_shade(0);
				break;
				case 296:
					seven_hbar_shade(1);
				break;
				case 297:
					seven_hbar_shade(2);
				break;
				case 298:
					seven_vbar_shade(0);
				break;
				case 299:
					seven_vbar_shade(1);
				break;
				case 300:
					seven_vbar_shade(2);
				break;
				case 301:
					seven_blur();
				break;
			}
		}
		function seven_3d_animate(code)
		{
			switch(code)
			{
				case 1:
					seven_paper_fold(0);
				break;
				case 2:
					seven_paper_fold(1);
				break;
				case 3:
					seven_paper_fold(2);
				break;
				case 4:
					seven_paper_fold(3);
				break;
				case 5:
					seven_paper_fold(4);
				break;
				case 6:
					seven_paper_fold(5);
				break;
				case 7:
					seven_paper_fold(6);
				break;
				case 8:
					seven_paper_fold(7);
				break;
				case 9:
					seven_paper_fold(8);
				break;
				case 10:
					seven_paper_fold(9);
				break;
				case 11:
					seven_paper_fold(10);
				break;
				case 12:
					seven_paper_fold(11);
				break;
				case 13:
					seven_paper_fold(12);
				break;
				case 14:
					seven_paper_fold(13);
				break;
				case 15:
					seven_paper_fold(14);
				break;
				case 16:
					seven_paper_fold(15);
				break;
				case 17:
					seven_paper_fold(16);
				break;
				case 18:
					seven_paper_fold(17);
				break;
				case 19:
					seven_paper_fold(18);
				break;
				case 20:
					seven_paper_fold(19);
				break;
				case 21:
					seven_turn();
				break;
				case 22:
					seven_cube(0);
				break;
				case 23:
					seven_cube(1);
				break;
				case 24:
					seven_cube(2);
				break;
				case 25:
					seven_cube(3);
				break;
				case 26:
					seven_bar_cube(0);
				break;
				case 27:
					seven_bar_cube(1);
				break;
				case 28:
					seven_bar_cube(2);
				break;
				case 29:
					seven_tiles_3d(0);
				break;
				case 30:
					seven_tiles_3d(1);
				break;
				case 31:
					seven_blinds_3d(0);
				break;
				case 32:
					seven_blinds_3d(1);
				break;
				case 33:
					seven_blinds_3d(2);
				break;
				case 34:
					seven_blinds_3d(3);
				break;
				case 35:
					seven_blinds_3d_turn(0);
				break;
				case 36:
					seven_blinds_3d_turn(1);
				break;
				case 37:
					seven_blinds_3d_turn(2);
				break;
				case 38:
					seven_blinds_3d_turn(3);
				break;
				case 39:
					seven_bar_scale_3d(0);
				break;
				case 40:
					seven_bar_scale_3d(1);
				break;
				case 41:
					seven_bar_scale_3d(2);
				break;
				case 42:
					seven_bar_scale_3d(3);
				break;
				case 43:
					seven_bar_dance(0);
				break;
				case 44:
					seven_bar_dance(1);
				break;
				case 45:
					seven_bar_dance(2);
				break;
				case 46:
					seven_bar_dance(3);
				break;
				case 47:
					seven_bar_rotate(0);
				break;
				case 48:
					seven_bar_rotate(1);
				break;
				case 49:
					seven_hbar_cube(0);
				break;
				case 50:
					seven_hbar_cube(1);
				break;
			}
		}
		/* 3d functions */
		function seven_paper_fold(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var current=handle.find("#seven_current");
			var next=handle.find("#seven_next").css("left","0%");
			//initialize for anim
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			blind+="<img src='"+psrc+"' style='position:absolute;left:0px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			$(blind).insertBefore(handle.find("#seven_next"));	
			//main func
			var o_object=handle.find("#seven_blind_container");
			var ordim=o_object.oriDomi({speed: 1000,perspective:1000,shading:'soft'}).oriDomi(true);
			o_object.find("img").animate({"opacity":0},{duration:1000,easing:"easeOutSine",complete:function(){  seven_animate_end(); }});
			switch(code)
			{
				case 0:
					ordim.foldUp();
				break;
				case 1:
					ordim.curl(-100);
				break;
				case 2:
					ordim.curl(100);
				break;
				case 3:
					ordim.stairs(90);
				break;
				case 4:
					ordim.stairs(-90);
				break;
				case 5:
					ordim.foldUp('top');
				break;
				case 6:
					ordim.curl(-100,'top');
				break;
				case 7:
					ordim.curl(100,'top');
				break;
				case 8:
					ordim.stairs(90,'top');
				break;
				case 9:
					ordim.stairs(-90,'top');
				break;
				case 10:
					ordim.foldUp('right');
				break;
				case 11:
					ordim.curl(-100,'right');
				break;
				case 12:
					ordim.curl(100,'right');
				break;
				case 13:
					ordim.stairs(90,'right');
				break;
				case 14:
					ordim.stairs(-90,'right');
				break;
				case 15:
					ordim.foldUp('bottom');
				break;
				case 16:
					ordim.curl(-100,'bottom');
				break;
				case 17:
					ordim.curl(100,'bottom');
				break;
				case 18:
					ordim.stairs(90,'bottom');
				break;
				case 19:
					ordim.stairs(-90,'bottom');
				break;
			}
		}
		function seven_turn()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			blind+="<img src='"+psrc+"' style='position:absolute;left:0px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/><img src='"+nsrc+"' style='position:absolute;left:0px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			$(blind).insertBefore(handle.find("#seven_next"));	
			handle.find("#seven_viewport").css("overflow","visible");
			handle.find(".seven_operate").hide();
			window.f = new flux.slider('#seven_blind_container', {
				autoplay: false,
				pagination: false,
				width:option.width,
				height:option.height,
				onTransitionEnd: function(data) {
					handle.find("#seven_viewport").css("overflow","hidden");
					handle.find(".seven_operate").show();
					seven_animate_end();
				}
			});
			setTimeout(function(){window.f.next("turn");},100);
			
		}
		function seven_cube(code)
		{
			if((seven_isIE()!=false&&seven_isIE()<9))
			{
				var p_arr=[3,2,0,1];
				seven_linear_move(p_arr[code%4]);
				return false;
			}
			else
			{
				var temp;
				if(code%4<2)
					temp='v';
				else
					temp='h';
				var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
				var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
				//initialize for anim
				handle.find("#seven_next").css("left","100%").css("top","0%");
				handle.find("#seven_current").css("left","0%").css("top","0%");	
				//prepare temp divs for transition
				blind='<div id="seven_blind_container" style=position:absolute;width:100%;height:100%;z-index:30;"><ul id="seven_slice_box" class="sb-slider" style="width:'+pimagewidth+'px;height:'+pimageheight+'px;position:absolute;left:0px;top:0px;margin:0;padding:0;"><li><a href="#" target="_blank"><img src="'+psrc+'" style="width:'+pimagewidth+'px;height:'+pimageheight+'px;" /></a></li><li><a href="#" target="_blank"><img src="'+nsrc+'" style="width:'+nimagewidth+'px;height:'+nimageheight+'px;" /></a></li></ul></div>';
				
				$(blind).insertBefore(handle.find("#seven_next"));
				
				//anim func
				handle.find("#seven_viewport").css("overflow","visible");
				handle.find(".seven_operate").hide();
				handle.find("#seven_current").show();
				handle.find("#seven_slice_box li").css("width","100%").css("height","100%");	
				handle.find("#seven_slice_box li img").css("width","100%").css("height","100%");	
				var slicebox = handle.find( '#seven_slice_box' ).slicebox(
				{
					orientation:temp,
					perspective : 1000,
					colorHiddenSides : '#555',
					speed : 800,
					sequentialFactor : 80,
					ease:'easeOutSine',
					cuboidsCount : 1+parseInt(code/4)*5,
					disperseFactor:parseInt(code/4)*15,
					onAfterChange:function(position)
					{
						//all Animation is done
						handle.find("#seven_viewport").css("overflow","hidden");
						handle.find(".seven_operate").show();
						seven_animate_end();
					}
				});
				//wait for initialization and run the anim			
				setTimeout(function(){
						handle.find("#seven_current").hide();									
						if(code%2==0)	slicebox.next();
						else	slicebox.previous();
				},50);
			}
		}
		function seven_bar_cube(code){
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var blind="<div id='seven_cube"+handle.index()+"' class='seven_cube' style='position:absolute;width:50%;height:100%;z-index:30'>";
			blind+="<img src='"+psrc+"' style='position:absolute;left:0px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/><img src='"+nsrc+"' style='position:absolute;left:100%;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			$(blind).insertBefore(handle.find("#seven_next"));	
			handle.find("#seven_viewport").css("overflow","visible");
			handle.find(".seven_operate").hide();
			handle.find("#seven_current").show();
			window.f = new flux.slider('#seven_cube'+handle.index(), {
				autoplay: false,
				pagination: false,
				width:option.width,
				height:option.height,
				column:4+code*2,
				onTransitionEnd: function(data) {
					handle.find("#seven_viewport").css("overflow","hidden");
					handle.find(".seven_operate").show();
					seven_animate_end();
				}
			});
			setTimeout(function(){window.f.next("bars3d");handle.find("#seven_current").hide();},100);
			
		}
		function seven_tiles_3d(code){
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			blind+="<img src='"+psrc+"' style='position:absolute;left:0px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/><img src='"+nsrc+"' style='position:absolute;left:100%;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			$(blind).insertBefore(handle.find("#seven_next"));	
			handle.find("#seven_viewport").css("overflow","visible");
			handle.find(".seven_operate").hide();
			handle.find("#seven_current").show();
			window.f = new flux.slider('#seven_blind_container', {
				autoplay: false,
				pagination: false,
				width:option.width,
				height:option.height,
				tdelay:200,
				index:code,
				column:6,
				onTransitionEnd: function(data) {
					handle.find("#seven_viewport").css("overflow","hidden");
					handle.find(".seven_operate").show();
					seven_animate_end();
				}
			});
			setTimeout(function(){window.f.next("tiles3d");handle.find("#seven_current").hide();},100);	
		}
		function seven_blinds_3d(code){
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			blind+="<img src='"+psrc+"' style='position:absolute;left:0px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			$(blind).insertBefore(handle.find("#seven_next"));	
			handle.find("#seven_viewport").css("overflow","visible");
			handle.find(".seven_operate").hide();
			handle.find("#seven_current").css("left",0).show();
			var delay=(code%2==0)?0:80;
			window.f = new flux.slider('#seven_blind_container', {
				autoplay: false,
				pagination: false,
				width:option.width,
				height:option.height,
				tdelay:delay,
				column:6-parseInt(code/2)*5,
				row:1+parseInt(code/2)*4,
				index:parseInt(code/2),
				onTransitionEnd: function(data) {
					handle.find("#seven_viewport").css("overflow","hidden");
					handle.find(".seven_operate").show();
					seven_animate_end();
				}
			});
			setTimeout(function(){	handle.find("#seven_current").hide();window.f.next("blinds3d");handle.find("#seven_next").css("left",0).show();},100);	
		}
		function seven_blinds_3d_turn(code){
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			blind+="<img src='"+psrc+"' style='position:absolute;left:0px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/><img src='"+nsrc+"' style='position:absolute;left:100%;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			$(blind).insertBefore(handle.find("#seven_next"));	
			handle.find("#seven_viewport").css("overflow","visible");
			handle.find(".seven_operate").hide();
			handle.find("#seven_current").show();
			var delay=(code%2==0)?0:80;
			window.f = new flux.slider('#seven_blind_container', {
				autoplay: false,
				pagination: false,
				width:option.width,
				height:option.height,
				tdelay:delay,
				column:6-parseInt(code/2)*5,
				row:1+parseInt(code/2)*4,
				index:parseInt(code/2),
				onTransitionEnd: function(data) {
					handle.find("#seven_viewport").css("overflow","hidden");
					handle.find(".seven_operate").show();
					seven_animate_end();
				}
			});
			setTimeout(function(){window.f.next("blinds3dturn");handle.find("#seven_current").hide();},100);	
		}
		function seven_bar_scale_3d(code){
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var blind="<div id='seven_cube"+handle.index()+"' class='seven_cube' style='position:absolute;width:50%;height:100%;z-index:30'>";
			blind+="<img src='"+psrc+"' style='position:absolute;left:0px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/><img src='"+nsrc+"' style='position:absolute;left:100%;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			$(blind).insertBefore(handle.find("#seven_next"));	
			handle.find("#seven_viewport").css("overflow","visible");
			handle.find(".seven_operate").hide();
			handle.find("#seven_current").show();
			window.f = new flux.slider('#seven_cube'+handle.index(), {
				autoplay: false,
				pagination: false,
				width:option.width,
				height:option.height,
				tdelay:50-(code%2)*50,
				column:4+parseInt(code/2)*2,
				onTransitionEnd: function(data) {
					handle.find("#seven_viewport").css("overflow","hidden");
					handle.find(".seven_operate").show();
					seven_animate_end();
				}
			});
			setTimeout(function(){window.f.next("barscale3d");handle.find("#seven_current").hide();},100);	
		}
		function seven_bar_dance(code){
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var blind="<div id='seven_cube"+handle.index()+"' class='seven_cube' style='position:absolute;width:50%;height:100%;z-index:30'>";
			blind+="<img src='"+psrc+"' style='position:absolute;left:0px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/><img src='"+nsrc+"' style='position:absolute;left:100%;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			$(blind).insertBefore(handle.find("#seven_next"));	
			handle.find("#seven_viewport").css("overflow","visible");
			handle.find(".seven_operate").hide();
			handle.find("#seven_current").show();
			window.f = new flux.slider('#seven_cube'+handle.index(), {
				autoplay: false,
				pagination: false,
				width:option.width,
				height:option.height,
				tdelay:50-(code%2)*50,
				column:4+parseInt(code/2)*2,
				onTransitionEnd: function(data) {
					handle.find("#seven_viewport").css("overflow","hidden");
					handle.find(".seven_operate").show();
					seven_animate_end();
				}
			});
			setTimeout(function(){window.f.next("bardance3d");handle.find("#seven_current").hide();},100);	
		}
		function seven_bar_rotate(code){
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var blind="<div id='seven_cube"+handle.index()+"' class='seven_cube' style='position:absolute;width:50%;height:100%;z-index:30'>";
			blind+="<img src='"+psrc+"' style='position:absolute;left:0px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/><img src='"+nsrc+"' style='position:absolute;left:100%;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			$(blind).insertBefore(handle.find("#seven_next"));	
			handle.find("#seven_viewport").css("overflow","visible");
			handle.find(".seven_operate").hide();
			handle.find("#seven_current").show();
			window.f = new flux.slider('#seven_cube'+handle.index(), {
				autoplay: false,
				pagination: false,
				width:option.width,
				height:option.height,
				tdelay:50-(code%2)*50,
				index:code,
				column:12,
				onTransitionEnd: function(data) {
					handle.find("#seven_viewport").css("overflow","hidden");
					handle.find(".seven_operate").show();
					seven_animate_end();
				}
			});
			setTimeout(function(){window.f.next("barrotate");handle.find("#seven_current").hide();handle.find("#seven_next").css("left",0).show();},100);	
		}
		function seven_hbar_cube(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var blind="<div id='seven_cube"+handle.index()+"' class='seven_cube' style='position:absolute;width:50%;height:100%;z-index:30'>";
			blind+="<img src='"+psrc+"' style='position:absolute;left:0px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/><img src='"+nsrc+"' style='position:absolute;left:100%;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			$(blind).insertBefore(handle.find("#seven_next"));	
			handle.find("#seven_viewport").css("overflow","visible");
			handle.find(".seven_operate").hide();
			handle.find("#seven_current").show();
			window.f = new flux.slider('#seven_cube'+handle.index(), {
				autoplay: false,
				pagination: false,
				width:option.width,
				height:option.height,
				tdelay:50-(code%2)*50,
				index:code,
				row:2-code,
				column:12,
				onTransitionEnd: function(data) {
					handle.find("#seven_viewport").css("overflow","hidden");
					handle.find(".seven_operate").show();
					seven_animate_end();
				}
			});
			setTimeout(function(){window.f.next("hbar3d");handle.find("#seven_current").hide();handle.find("#seven_next").css("left",0).show();},100);	
		}
		/* 2d functions */
		function seven_linear_move(code)
		{
			var p_arr=[[100,0,0,0],[-100,0,0,0],[0,100,0,0],[0,-100,0,0]];
			var t_arr=[[-option.width,0],[option.width,0],[0,-option.height],[0,option.height]];
			//initialize for anim
			handle.find("#seven_next").css("left",p_arr[code][0]+"%").css("top",p_arr[code][1]+"%");
			handle.find("#seven_current").css("left",p_arr[code][2]+"%").css("top",p_arr[code][3]+"%");
			//anim func
			handle.find('.seven_animate').each(function(i)
			{
				$(this).animate({
					"left":"+="+t_arr[code][0]+"px",
					"top":"+="+t_arr[code][1]+"px",
				},
				{
					duration:800,
					easing:"easeInOutSine",
					complete: function()
					{
						 //All animation is done
						 if(i==0) seven_animate_end(); 
					}
				});
			});
		}
		function seven_vbar_move(code)
		{
			var p_arr=[-1,1,-1,1,-1,1];
			var pease=["easeInOutQuad","easeInOutQuad","easeOutBack","easeOutBack","easeOutBack","easeOutBack"];
			var pfg=[1,0,1,0,0,1];
			var pimagewidth=handle.find("#seven_current image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
			
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			for(var i=0;i<20;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/20);
				var temp=t_width*i;		
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+(-p_arr[code]*option.width+temp)+"px;top:0%;'><img src='"+nsrc+"' style='position:absolute;left:-"+temp+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));			
			handle.find(".seven_blind_slide").css("opacity",0);
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
			  var temp;
			  if(pfg[code]==1)
				temp=i;
			  else
				temp=19-i;
				$(this).delay(temp*40).animate({
					"left":"+="+p_arr[code]*option.width+"px",
					"opacity":1,
				},
				{
					duration:800,
					easing:pease[code],
					complete: function()
					{	
						 // All animation is done
						 if(temp==19)						 
							seven_animate_end(); 
					}												 
				});
			});	  
		}
		function seven_hbar_move(code)
		{
		  var p_arr=[-1,1,-1,1,-1,1];
		  var pease=["easeOutSine","easeOutSine","easeOutBack","easeOutBack","easeOutBack","easeOutBack"];
		  var pfg=[0,1,0,1,1,0];
		 var pimagewidth=handle.find("#seven_current image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		  //initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/10);
				var temp=t_height*i;
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0%;top:"+(p_arr[code]*option.height+temp)+"px;'><img src='"+nsrc+"' style='position:absolute;top:-"+temp+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
				
			handle.find(".seven_blind_slide").css("opacity",0);
					
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				if(pfg[code]==1)
					temp=i;
				else
					temp=9-i;
				$(this).delay(temp*60).animate({
					"top":"+="+(-p_arr[code]*option.height)+"px",
					"opacity":1,
				},
				{
					duration:800,
					easing:pease[code],
					complete: function()
					{	
						 // All animation is done
						 if(temp==9)						 
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_hbar_rmove(code)
		{
		  var p_arr=[-1,1,-1,1,-1,1,-1,1,1,-1,1,-1,1,-1,1,-1,-1,1,-1,1,-1,1,-1,1];
		  var pease=["easeOutSine","easeOutSine","easeOutSine","easeOutSine","easeOutBack","easeOutBack","easeOutBack","easeOutBack","easeOutSine","easeOutSine","easeOutSine","easeOutSine","easeOutBack","easeOutBack","easeOutBack","easeOutBack","easeOutBounce","easeOutBounce","easeOutBounce","easeOutBounce","easeOutBounce","easeOutBounce","easeOutBounce","easeOutBounce"];
		  var pfg=[0,0,1,1,0,0,1,1,-1,-1,-2,-2,-1,-1,-2,-2,0,0,-1,-1,-2,-2,1,1];
		  var time=(code>15)?1800:800;
		  var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
		  var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		  //initialize for anim
		  handle.find("#seven_next").css("left","100%").css("top","0%");
		  handle.find("#seven_current").css("left","0%").css("top","0%");	
		
		  //prepare temp divs for transition
		  var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
		  var sequence;
		  if(pfg[code]==-1)
				sequence=seven_rand_generator(10);
		  else
				sequence=[4,3,2,1,0,0,1,2,3,4];
		  for(var i=0;i<10;i++)
		  {
				//calculate div pos
				var t_height=Math.ceil(option.height/10);
				var temp=t_height*i;
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:"+(-p_arr[code]*option.width)+"px;top:"+temp+"px;'><img src='"+nsrc+"' style='position:absolute;top:-"+temp+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
		  }
		  blind+="</div>";
		  $(blind).insertBefore(handle.find("#seven_next"));
					
		  handle.find(".seven_blind_slide").css("opacity",0);
					
		  //anim func
		  handle.find(".seven_blind_slide").each(function(i)
		  {
				var temp;
				if(pfg[code]==0) 
					temp=i;
				else if(pfg[code]>0)
					temp=9-i;
				else
					temp=sequence[i];
				$(this).delay(temp*60).animate({
					"left":"+="+p_arr[code]*option.width+"px",
					"opacity":1,
				},
				{
					duration:time,
					easing:pease[code],
					complete: function()
					{	
						 // All animation is done
						 if(pfg[code]!=-2){
							if(temp==9)		seven_animate_end(); 
						 }
						 else
						 {
							 if(i==9)	seven_animate_end(); 
						 }
					}												 
				});
		  });
		}
		function seven_vbar_rmove(code)
		{
			var p_arr=[-1,1,-1,1,-1,1,-1,1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1];
			var pease=["easeOutSine","easeOutSine","easeOutSine","easeOutSine","easeOutBack","easeOutBack","easeOutBack","easeOutBack","easeOutSine","easeOutSine","easeOutSine","easeOutSine","easeOutBack","easeOutBack","easeOutBack","easeOutBack","easeOutBounce","easeOutBounce","easeOutBounce","easeOutBounce","easeOutBounce","easeOutBounce","easeOutBounce","easeOutBounce"];
			var pfg=[0,0,1,1,0,0,1,1,-1,-1,-2,-2,-1,-1,-2,-2,0,0,1,1,-1,-1,-2,-2];
			var time=(code>15)?1800:800;
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			var sequence;
			if(pfg[code]==-1)
				sequence=seven_rand_generator(10);
			else
				sequence=[4,3,2,1,0,0,1,2,3,4];
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/10);
				var temp=t_width*i;
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+temp+"px;top:"+(p_arr[code]*option.height)+"px;'><img src='"+nsrc+"' style='position:absolute;left:-"+temp+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			handle.find(".seven_blind_slide").css("opacity",0);
			
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{	
				var temp;
				if(pfg[code]==0) 
					temp=i;
				else if(pfg[code]>0)
					temp=9-i;
				else
					temp=sequence[i];
				$(this).delay(temp*60).animate({
					"top":"+="+(-p_arr[code]*option.height)+"px",
					"opacity":1,
		
		
				},
				{
					duration:time,
					easing:pease[code],
					complete: function()
					{	
						 // All animation is done
						 if(pfg[code]!=-2){
							if(temp==9)		seven_animate_end(); 
						 }
						 else
						 {
							 if(i==9)	seven_animate_end(); 
						 }
					}												 
				});
			});	  
		}
		function seven_hcenter_stretch(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var sequence;
			var number=(code==0)?10:1;
			sequence=(code==0)?[4,3,2,1,0,0,1,2,3,4]:[0,0];
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			for(var i=0;i<number;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/number);
				var temp=t_height*i;
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:"+temp+"px;'><img src='"+nsrc+"' style='position:absolute;top:-"+temp+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:"+Math.ceil(option.width/2)+"px'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			handle.find(".seven_blind_slide img").css("opacity",0);
			handle.find(".seven_blind_slide img").css("width",0);
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				$(this).find("img").delay(sequence[i]*80).animate({
					"left":"0px",
					"width":nimagewidth,
					"opacity":1,
				},
				{
					duration:800,
					easing:"easeOutSine",	
					complete: function()
					{	
						 // All animation is done
						 if(i==number-1)						 
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_vcenter_stretch(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			var sequence;
			var number=(code==0)?10:1;
			sequence=(code==0)?[4,3,2,1,0,0,1,2,3,4]:[0,0];
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			for(var i=0;i<number;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/number);
				var temp=t_width*i;
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+temp+"px;top:0px;'><img src='"+nsrc+"' style='position:absolute;left:-"+temp+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;top:"+Math.ceil(option.height/2)+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			handle.find(".seven_blind_slide img").css("opacity",1);
			handle.find(".seven_blind_slide img").css("height",0);
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{					
				$(this).find("img").delay(sequence[i]*60).animate({
					"top":"0px",
					"height":nimageheight+"px",
					"opacity":1,
				},
				{
					duration:800,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
						 if(i==number-1)						 
							seven_animate_end(); 
					}												 
				});
			});	
		}
		function seven_hbar_intersect(code)
		{
			var pease=["easeOutSine","easeOutSine","easeOutBack","easeOutBack","easeOutSine","easeOutBack","easeOutBounce","easeOutBounce"];
			var pfg=[0,1,0,1,2,2,0,1];
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/10);
				var temp=option.width-option.width*2*(i%2);
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:"+temp+"px;top:"+t_height*i+"px;'><img src='"+nsrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
				
			handle.find(".seven_blind_slide").css("opacity",0);
					
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				if(pfg[code]==0)
					temp=i;
				else if(pfg[code]==1)
					temp=9-i;
				else
					temp=0;
				$(this).delay(temp*60).animate({
					"left":"0px",
					"opacity":1,
				},
				{
					duration:800,
					easing:pease[code],
					complete: function()
					{	
						 // All animation is done
						 if(pfg[code]==2)
						 {
							 if(i==9)
								seven_animate_end();
						 }
						 else if(temp==9)						 
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_vbar_intersect(code)
		{
			var pease=["easeOutSine","easeOutSine","easeOutBack","easeOutBack","easeOutSine","easeOutBack","easeOutBounce","easeOutBounce"];
			var pfg=[0,1,0,1,2,2,0,1];
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		   //initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/10);
				var temp=option.height-option.height*2*(i%2);
						
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:"+temp+"px;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
					
			handle.find(".seven_blind_slide").css("opacity",0);
					
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{					
				var temp;
				if(pfg[code]==0)
					temp=i;
				else if(pfg[code]==1)
					temp=9-i;
				else
					temp=0;
				$(this).delay(temp*60).animate({
					"top":"0px",
					"opacity":1,
				},
				{
					duration:800,
					easing:pease[code],
					complete: function()
					{	
						 // All animation is done
						 if(pfg[code]==2)
						 {
							 if(i==9)
								seven_animate_end();
						 }
						 else if(temp==9)						 
							seven_animate_end(); 
					}												 
				});
			});	
		}
		function seven_fade()
		{
		   //initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");		
					
			//prepare for anim
			handle.find("#seven_next").css("opacity",0);
					
			//anim func
			handle.find("#seven_next").animate({
				"opacity":1,
			},
			{
				duration:800,
				easing:"easeOutSine",
				complete: function()
				{	
					// All animation is done
					seven_animate_end(); 
				}												 
					
			});
		}
		function seven_fade_overlap()
		{
		   var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		   //initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			var b_pos=[[-100,-100],[-100,100],[100,100],[100,-100]];
			for(var i=0;i<4;i++)
			{
				//calculate div pos
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:100%;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:"+b_pos[i][0]+"px;top:"+b_pos[i][1]+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			handle.find(".seven_blind_slide img").css("opacity",0);
					
			//anim func
			handle.find(".seven_blind_slide img").each(function(i)
			{
				$(this).animate({
					"left":0,
					"top":0,
					"opacity":1,
				},
				{
					duration:600,
					easing:"easeOutQuad",
					complete: function()
					{	
						 // All animation is done
						 if(i==3)
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_blind(code)
		{ 
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		   //initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");		
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			for(var i=0;i<12;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/12);					
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:0px;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp,finish;
				if(code==0)		temp=0;
				else if(code==1)	temp=i;
				else if(code==2)	temp=11-i;
				finish=(code==2)?0:11;
				$(this).delay(temp*50).animate({
					"width":0,
				},
				{
					duration:500,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
						 if(i==finish)
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_vblind(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		   //initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");		
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			for(var i=0;i<12;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/12);					
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:"+t_height*i+"px;'><img src='"+psrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
					
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp,finish;
				if(code==0)		temp=0;
				else if(code==1)	temp=i;
				else if(code==2)	temp=11-i;
				finish=(code==2)?0:11;
				$(this).delay(temp*50).animate({
					"height":0,
				},
				{
					duration:500,
					easing:"easeOutQuad",
					complete: function()
					{	
						 // All animation is done
						 if(i==finish)
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_blind_spread(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");		
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var sequence=[7,6,5,4,3,2,1,0,0,1,2,3,4,5,6,7];
			var t_width=Math.ceil(option.width/16);			
			var t_height=Math.ceil(option.height/16);
			for(var i=0;i<16;i++)
			{
				//calculate div pos
				var temp;
				var temp_width,temp_height;
				if(i<8){
					temp="#seven_current .seven_image";
					temp_width=t_width;
					temp_height=t_height;
				}
				else{
					temp="#seven_next .seven_image";
					temp_width=0;
					temp_height=0;
				}
				
				if(code==0)
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+temp_width+"px;height:100%;left:"+t_width*i+"px;top:0px;z-index:2;'><img src='"+$(temp).attr("src")+"' style='position:absolute;left:-"+t_width*i+"px;width:"+$(temp).width()+"px;height:"+$(temp).height()+"px;'/></div>";
				else
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+temp_height+"px;left:0px;top:"+t_height*i+"px;z-index:2;'><img src='"+$(temp).attr("src")+"' style='position:absolute;top:-"+t_height*i+"px;width:"+$(temp).width()+"px;height:"+$(temp).height()+"px;'/></div>";
				//for tentative bg
				if(i>7){
					if(code==0)
						blind+="<div class='temp_seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:0px;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";
					else
						blind+="<div class='temp_seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:"+t_height*i+"px;'><img src='"+psrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";
				}
				
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp=0;
				var abt="";
				if(i>7)	{
					if(code==0)
						temp=t_width;
					else
						temp=t_height;
				}
		
				if(code==0)
				{
					$(this).delay(sequence[i]*100).animate({
						"width":temp+"px",
					},
					{
						duration:400,
						easing:"easeOutQuad",
						complete: function()
						{	
							 // All animation is done
							 if(i==15)
								seven_animate_end(); 
						}												 
					});
				}
				else
				{
					$(this).delay(sequence[i]*100).animate({
						"height":temp+"px",
					},
					{
						duration:400,
						easing:"easeOutQuad",
						complete: function()
						{	
							 // All animation is done
							 if(i==15)
								seven_animate_end(); 
						}												 
					});
				}
			});
		}
		function seven_cut()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");		
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var pos_arr=[-option.width,0];
			var src_arr=[["#seven_next .seven_image","#seven_current .seven_image"],["#seven_current .seven_image","#seven_next .seven_image"]];
			for(var i=0;i<2;i++)
			{
				//add sub divs for transition
				var t_height=Math.ceil(option.height/2);
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:200%;height:"+t_height+"px;left:"+pos_arr[i]+"px;top:"+t_height*i+"px;'><div class='seven_sub_blind_slide' style='float:left;width:50%;height:100%;'><img src='"+$(src_arr[i][0]).attr("src")+"' style='position:absolute;top:-"+t_height*i+"px;width:"+$(src_arr[i][0]).width()+"px;height:"+$(src_arr[i][0]).height()+"px;'/></div><div class='seven_sub_blind_slide' style='float:left;width:50%;height:100%;'><img src='"+$(src_arr[i][1]).attr("src")+"' style='position:absolute;top:-"+t_height*i+"px;width:"+$(src_arr[i][1]).width()+"px;height:"+$(src_arr[i][1]).height()+"px;'/></div></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				$(this).animate({
					"left": pos_arr[1-i]+"px",
				},
				{
					duration:500,
					easing:"easeInOutQuad",
					complete: function()
					{	
						 // All animation is done
						if(i==0) seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_vcut(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,1,-1,-1];
			var pfg=[0,1,0,1];
		   //initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");		
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
					
			for(var i=0;i<5;i++)
			{
				//add sub divs for transition
				var t_width=Math.ceil(option.width/5);		
				if(p_arr[code]==1)
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:200%;left:"+t_width*i+"px;top:-"+option.height+"px;'><div class='seven_sub_blind_slide' style='width:100%;height:50%;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div><div class='seven_sub_blind_slide' style='width:100%;height:50%;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";		
				else
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:200%;left:"+t_width*i+"px;top:0px;'><div class='seven_sub_blind_slide' style='width:100%;height:50%;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div><div class='seven_sub_blind_slide' style='width:100%;height:50%;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div></div>";
				
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
					
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				if(pfg[code]==0)
					temp=i;
				else
					temp=4-i;
				$(this).delay(150*temp).animate({
					"top":"+="+(p_arr[code]*option.height)+"px",
				},
				{
					duration:400,
					easing:"easeInOutQuad",
					complete: function()
					{	
						 // All animation is done
						 if(temp==4)
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_hcut(code)
		{
		   var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,-1,1,-1];
			var pfg=[0,0,1,1];
		   //initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");		
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
					
			for(var i=0;i<5;i++)
			{
				//add sub divs for transition
				var t_height=Math.ceil(option.height/5);		
				if(p_arr[code]==1)
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:200%;height:"+t_height+"px;left:-"+option.width+"px;top:"+t_height*i+"px;'><div class='seven_sub_blind_slide' style='float:left;width:50%;height:100%;'><img src='"+nsrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div><div class='seven_sub_blind_slide' style='float:left;width:50%;height:100%;'><img src='"+psrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";		
				else
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:200%;height:"+t_height+"px;left:0px;top:"+t_height*i+"px;'><div class='seven_sub_blind_slide' style='float:left;width:50%;height:100%;'><img src='"+psrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div><div class='seven_sub_blind_slide' style='float:left;width:50%;height:100%;'><img src='"+nsrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div></div>";	
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
		
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				if(pfg[code]==0)
					temp=i;
				else
					temp=4-i;
				$(this).delay(100*temp).animate({
					"left":"+="+(p_arr[code]*option.width)+"px",
				},
				{
					duration:500,
					easing:"easeOutQuad",
					complete: function()
					{	
						 // All animation is done
						 if(temp==4)
							seven_animate_end(); 
					}												 
				});
			});				
		}
		function seven_square(code)
		{
		   var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
		   var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		   var p_arr=[[-1,1],[1,1],[-1,-1],[1,-1],[-1,1],[1,1],[-1,-1],[1,-1]];
		   var pfg=[0,1,0,1,0,1,0,1];
		   var pease=["easeOutExpo","easeOutExpo","easeOutExpo","easeOutExpo","easeOutBack","easeOutBack","easeOutBack","easeOutBack"];
		   //initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
					
			for(var i=0;i<18;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/6);
				var t_height=Math.ceil(option.height/3);
				var row=i%3;
				var col=parseInt(i/3);
						
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+(t_width*col+p_arr[code][0]*200)+"px;top:"+(t_height*row+p_arr[code][1]*200)+"px;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			}
			blind+="</div>";
		
				
			$(blind).insertBefore(handle.find("#seven_next"));
			handle.find(".seven_blind_slide img").css("opacity",0);
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				temp=(pfg[code]==0)?17-i:i;				
				$(this).find("img").delay(60*temp).animate({
					"opacity":0.8,
				},
				{
					duration:300,
					easing:pease[code],
					complete: function()
					{
						// second anim func-> fadeTo opacity:1
						 $(this).animate({
							//opacity fade to final phase:1
							"opacity":"1",
						},
						{
							duration:50,
							easing:pease[code],
							complete: function()
							{	
								 // All animation is done
								 if(temp==17)
									seven_animate_end(); 
							}												 
						});
					}
				});
				$(this).delay(60*temp).animate({
					"left":"+="+(-p_arr[code][0]*200)+"px",
					"top":"+="+(-p_arr[code][1]*200)+"px",
				},
				{
					duration:300,
					easing:pease[code],
					complete: function()
					{	
					}												 
				});
			});		
		}
		function seven_square_fade(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[[1,1],[-1,1],[1,-1],[-1,-1],[0,0],[0,0]];
			var pfg=[0,0,0,0,1,0];
		   //initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			
			for(var i=0;i<18;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/6);
				var t_height=Math.ceil(option.height/3);
				var row=i%3;
				var col=parseInt(i/3);
					
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			}
			blind+="</div>";
					
			$(blind).insertBefore(handle.find("#seven_next"));
					
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				if(pfg[code]==0)
					temp=i;
				else
					temp=17-i;
				$(this).find("img").delay(40*temp).animate({
					"opacity":0,
				},
				{
					duration:500,
					easing:"easeOutQuad",
					complete: function()
					{	
					}												 
				});
				$(this).delay(40*temp).animate({
					"left":"+="+p_arr[code][0]*100+"px",
					"top":"+="+p_arr[code][1]*100+"px",
				},
				{
					duration:500,
					easing:"easeOutQuad",
					complete: function()
					{	
						 // All animation is done
						 if(temp==17)
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_hsquare_fade(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[[0,0,0],[0,0,0],[1,1,1],[-1,1,1],[1,-1,1],[-1,-1,1]];
			var pfg=[0,1,0,0,0,0];
		   //initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
					
			for(var i=0;i<18;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/6);
				var t_height=Math.ceil(option.height/3);
				if(code<2)
				{
					row=parseInt(i/6);
					col=i%6;
				}
				else
				{
					row=i%3;
					col=parseInt(i/3);
				}
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			}
			blind+="</div>";
					
			$(blind).insertBefore(handle.find("#seven_next"));
					
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				if(pfg[code]==0) temp=i;
				else
					temp=17-i;
				$(this).find("img").delay(50*temp).animate({
					"opacity":0,
				},
				{
					duration:450,
					easing:"easeInOutBack",
					complete: function()
					{	
					}												 
				});
				$(this).delay(50*temp).animate({
					"left":"+="+p_arr[code][0]*20+"px",
					"top":"+="+p_arr[code][1]*20+"px",
					"width":"+="+p_arr[code][2]*100+"px",
					"height":"+="+p_arr[code][2]*100+"px",
				},
				{
					duration:450,
					easing:"easeInOutBack",
					complete: function()
					{	
						 // All animation is done
						 if(temp==17)
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_square_plazma(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[-1,1];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var sequence;
			if(code==0)
				sequence=[0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9];
			else
				sequence=[9,8,7,6,5,4,3,2,1,0,9,8,7,6,5,4,3,2,1,0];
					
			for(var i=0;i<20;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/10);
				var t_height=Math.ceil(option.height/2);
				var row=parseInt(i/10);
				var col=i%10;
				var temp;
				
				if(row==0)
				{
					temp=t_height*row-t_height;
				}
				else
				{
					temp=t_height*row+t_height;												
				}
					
				if(code==0)
					blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+temp+"px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:"+t_height+"px;left:50px;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div></div>";		
				else
					blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+temp+"px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:"+t_height+"px;left:-50px;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div></div>";
		
					
			}
			blind+="</div>";
		
			$(blind).insertBefore(handle.find("#seven_next"));
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				var temp;
				var ate;
				ate=(code==0)?9:0;
				if(i<10)
					temp="+="+Math.ceil(option.height/2)+"px";
				else
					temp="-="+Math.ceil(option.height/2)+"px";
				$(this).delay(100*sequence[i]).animate({
					  "top":temp,												
				},{
					  duration:400,
					  easing: "easeOutQuad",
					  complete: function(){
					  }
				});
						
				$(this).find(".seven_blind_slide").delay(100*sequence[i]).animate({
					  "left":"+="+p_arr[code]*50+"px",												
					  "opacity":1,
				},{
					  duration:700,
					  easing: "easeOutSine",
					  complete: function(){
						  if(i==ate)
						  {
							  //All animation is done
							  seven_animate_end();
						  }
					  }
				});
			});	  
		}
		function seven_vsquare_plazma(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,1,-1,-1];
			var pfg=[0,1,1,0];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var sequence;
			if(pfg[code]==0)
				sequence=[0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9];
			else
				sequence=[9,9,8,8,7,7,6,6,5,5,4,4,3,3,2,2,1,1,0,0];
			
			for(var i=0;i<20;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/2);
				var t_height=Math.ceil(option.height/10);
				var row=parseInt(i/2);
				var col=i%2;
				var temp;
						
				if(col==0)
				{
					temp=t_width*col-t_width;
				}
				else
				{
					temp=t_width*col+t_width;												
				}
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height*2+"px;left:"+temp+"px;top:"+t_height*row+"px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height*2+"px;top:"+p_arr[code]*50+"px;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div></div>";		
			}
			blind+="</div>";
					
			$(blind).insertBefore(handle.find("#seven_next"));
		
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				var temp;
				var ate;
				ate=(pfg[code]==0)?19:0;
				if(i%2==0)
					temp="+="+Math.ceil(option.width/2)+"px";
				else
					temp="-="+Math.ceil(option.width/2)+"px";
				$(this).delay(100*sequence[i]).animate({
					  "left":temp,												
				},{
					  duration:400,
					  easing: "easeOutQuad",
					  complete: function(){
						  }
				});
					
				$(this).find(".seven_blind_slide").delay(100*sequence[i]).animate({
					  "top":"+="+(-p_arr[code]*50)+"px",												
					  "opacity":1,
				},{
					  duration:700,
					  easing: "easeOutSine",
					  complete: function(){
						  if(i==ate)
						  {
							  //All animation is done
							  seven_animate_end();
						  }
					  }
				});
			});	  
		}
		function seven_border_hide(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		   //initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var sequence;
			if(code==0)
				sequence=[0,1,2,3,4,5,13,14,15,16,17,6,12,11,10,9,8,7];
			else if(code==1)
				sequence=[0,1,2,3,4,5,11,10,9,8,7,6,12,13,14,15,16,17];
			else if(code==2)
				sequence=[17,16,15,14,13,12,6,7,8,9,10,11,5,4,3,2,1,0];
			else if(code==3)
				sequence=[0,5,6,11,12,17,1,4,7,10,13,16,2,3,8,9,14,15];
			else if(code==4)
				sequence=[15,14,9,8,3,2,16,14,10,7,4,1,17,12,11,6,5,0];
				
			for(var i=0;i<18;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/6);
				var t_height=Math.ceil(option.height/3);
				var row=parseInt(i/6);
				var col=i%6;
						
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			}
			blind+="</div>";
				
			$(blind).insertBefore(handle.find("#seven_next"));
				
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				$(this).find("img").delay(40*sequence[i]).animate({
					"opacity":"0",
				},
				{
					duration:500,
					easing:"easeOutQuad",
					complete: function()
					{	
						 // All animation is done
						 if(sequence[i]==17)
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_random_hide()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var sequence=seven_rand_generator(30);
			for(var i=0;i<30;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/6);
				var t_height=Math.ceil(option.height/5);
				var row=parseInt(i/6);
				var col=i%6;
						
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			}
			blind+="</div>";
					
			$(blind).insertBefore(handle.find("#seven_next"));
				
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				$(this).find("img").delay(30*sequence[i]).animate({
					"opacity":"0",
				},
				{
					duration:500,
					easing:"easeOutQuad",
					complete: function()
					{	
						 // All animation is done
						 if(sequence[i]==29)
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_vplazma(code)
		{
			var p_arr=[-1,1];
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
					
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/10);
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:100%;left:"+(t_width*i+p_arr[code]*50)+"px;top:0px;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*i+"px;top:0px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
		
						
			}
			blind+="</div>";
				
			$(blind).insertBefore(handle.find("#seven_next"));
			handle.find(".seven_blind_slide").find("img").css("opacity",0);
					
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				temp=(code==0)?9-i:i;
				$(this).find("img").delay(100*temp).animate({
					  "opacity":"1",	
				},{
					  duration:500,
					  easing: "easeInQuad",
					  complete: function()
					  {
					  }
				});
				$(this).delay(100*temp).animate({
					  "left":"+="+(-p_arr[code]*50)+"px",	
				},{
					  duration:500,
					  easing: "easeInQuad",
					  complete: function()
					  {
							//All animation is done
							if(temp==9)
								seven_animate_end();
					  }
				});
			});			
		}
		function seven_hplazma(code)
		{
			var p_arr=[-1,1];
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
					
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/10);
						
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height*2+"px;left:0px;top:"+(t_height*i+p_arr[code]*30)+"px;'><img src='"+nsrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";				
			}
			blind+="</div>";
					
			$(blind).insertBefore(handle.find("#seven_next"));
			handle.find(".seven_blind_slide img").css("opacity",0);
					
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				temp=(code==0)?9-i:i;
				$(this).find("img").delay(100*temp).animate({
					  "opacity":1,
				},{
					  duration:500,
					  easing: "easeInQuad",
					  complete: function()
					  {
					  }
				});
				$(this).delay(100*temp).animate({
					  "top":"+="+(-p_arr[code]*30)+"px",	
				},{
					  duration:500,
					  easing: "easeInQuad",
					  complete: function()
					  {
							//All animation is done
							if(temp==9)
								seven_animate_end();
					  }
				});
			});
		}
		function seven_water()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		  //initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var radius=Math.ceil(Math.max(option.width,option.height)/20);				
			var centerx=Math.ceil(option.width/2);
			var centery=Math.ceil(option.height/2);
					
			for(var i=10;i>=0;i--)
			{
				//calculate div pos
				var tempx,tempy;
				if((centerx-radius*(i+1))>0)
					tempx="-"+(centerx-radius*(i+1));
				else
					tempx=Math.abs(centerx-radius*(i+1));
				
				if((centery-radius*(i+1))>0)
					tempy="-"+(centery-radius*(i+1));
				else
					tempy=Math.abs(centery-radius*(i+1));
						
				if(seven_isIE()!=false&&seven_isIE()<9)
				{
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+radius*2*(i+1)+"px;height:"+radius*2*(i+1)+"px;left:"+(centerx-radius*(i+1))+"px;top:"+(centery-radius*(i+1))+"px;border-radius:"+radius*2*(i+1)+"px;'><img src='"+nsrc+"' style='position:absolute;left:"+tempx+"px;top:"+tempy+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
				}
				else
				{
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+radius*2*(i+1)+"px;height:"+radius*2*(i+1)+"px;left:"+(centerx-radius*(i+1))+"px;top:"+(centery-radius*(i+1))+"px;border-radius:"+radius*2*(i+1)+"px;background:url("+nsrc+");background-size:"+nimagewidth+"px "+nimageheight+"px;background-position: "+tempx+"px "+tempy+"px;background-repeat:no-repeat;'></div>";
				}							
				
			}
			blind+="</div>";
					
			$(blind).insertBefore(handle.find("#seven_next"));
			if(seven_isIE()<9&&seven_isIE()!=false)
			{
				handle.find(".seven_blind_slide img").css("opacity",0);
				//anim func
				handle.find(".seven_blind_slide").each(function(i)
				{
					$(this).find("img").delay(50*(10-i)).animate({
						  "opacity":1,
					},{
						  duration:600,
						  easing: "easeInQuad",
						  complete: function()
						  {
								//All animation is done
								if(i==0)
									seven_animate_end();
						  }
					});
				});
			}
			else
			{
				handle.find(".seven_blind_slide").css("opacity",0);
				//anim func
				handle.find(".seven_blind_slide").each(function(i)
				{
					$(this).delay(50*(10-i)).animate({
						  "opacity":1,
					},{
						  duration:600,
						  easing: "easeInQuad",
						  complete: function()
						  {
								//All animation is done
								if(i==0)
									seven_animate_end();
						  }
					});
				});
			}
		}
		function seven_water_inside()
		{
		  
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var radius=Math.ceil(Math.max(option.width,option.height)/20);				
			var centerx=Math.ceil(option.width/2);
			var centery=Math.ceil(option.height/2);
					
			for(var i=10;i>=0;i--)
			{
				//calculate div pos
				var tempx,tempy;
				if((centerx-radius*(i+1))>0)
					tempx="-"+(centerx-radius*(i+1));
				else
					tempx=Math.abs(centerx-radius*(i+1));
				
				if((centery-radius*(i+1))>0)
					tempy="-"+(centery-radius*(i+1));
				else
					tempy=Math.abs(centery-radius*(i+1));
				if(seven_isIE()!=false&&seven_isIE()<9)
				{
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+radius*2*(i+1)+"px;height:"+radius*2*(i+1)+"px;left:"+(centerx-radius*(i+1))+"px;top:"+(centery-radius*(i+1))+"px;border-radius:"+radius*2*(i+1)+"px;'><img src='"+psrc+"' style='position:absolute;left:"+tempx+"px;top:"+tempy+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
				}
				else
				{
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+radius*2*(i+1)+"px;height:"+radius*2*(i+1)+"px;left:"+(centerx-radius*(i+1))+"px;top:"+(centery-radius*(i+1))+"px;border-radius:"+radius*2*(i+1)+"px;background:url("+psrc+");background-size:"+pimagewidth+"px "+pimageheight+"px;background-position: "+tempx+"px "+tempy+"px;background-repeat:no-repeat;'></div>";
				}
			}
			blind+="</div>";
					
			$(blind).insertBefore(handle.find("#seven_next"));
			if(seven_isIE()!=false&&seven_isIE()<9)
			{
				handle.find(".seven_blind_slide img").css("opacity",1);
				//anim func
				handle.find(".seven_blind_slide img").each(function(i)
				{
					$(this).delay(50*i).animate({
						  "opacity":0,
					},{
						  duration:600,
						  easing: "easeInQuad",
						  complete: function()
						  {
								//All animation is done
								if(i==10)
									seven_animate_end();
						  }
					});
				});
			}
			else
			{
				handle.find(".seven_blind_slide").css("opacity",1);
				//anim func
				handle.find(".seven_blind_slide").each(function(i)
				{
					$(this).delay(50*i).animate({
						  "opacity":0,
					},{
						  duration:600,
						  easing: "easeInQuad",
						  complete: function()
						  {
								//All animation is done
								if(i==10)
									seven_animate_end();
						  }
					});
				});
			}
		}
		function seven_water_rotate_cross()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		   //initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var radius=Math.ceil(Math.max(option.width,option.height)/20);				
			var centerx=Math.ceil(option.width/2);
			var centery=Math.ceil(option.height/2);
			
			for(var i=10;i>=0;i--)
			{
				//calculate div pos
				var tempx,tempy;
				if((centerx-radius*(i+1))>0)
					tempx="-"+(centerx-radius*(i+1));
				else
					tempx=Math.abs(centerx-radius*(i+1));
				
				if((centery-radius*(i+1))>0)
					tempy="-"+(centery-radius*(i+1));
				else
					tempy=Math.abs(centery-radius*(i+1));
				
				if(seven_isIE()!=false&&seven_isIE()<9)
				{
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+radius*2*(i+1)+"px;height:"+radius*2*(i+1)+"px;left:"+(centerx-radius*(i+1))+"px;top:"+(centery-radius*(i+1))+"px;border-radius:"+radius*2*(i+1)+"px;'><img src='"+psrc+"' style='position:absolute;left:"+tempx+"px;top:"+tempy+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
				}
				else
				{
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+radius*2*(i+1)+"px;height:"+radius*2*(i+1)+"px;left:"+(centerx-radius*(i+1))+"px;top:"+(centery-radius*(i+1))+"px;border-radius:"+radius*2*(i+1)+"px;background:url("+psrc+");background-size:"+pimagewidth+"px "+pimageheight+"px;background-position: "+tempx+"px "+tempy+"px;background-repeat:no-repeat;'></div>";
				}		
		
				
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
			
			if(seven_isIE()>8||seven_isIE()==false)
			{
				handle.find(".seven_blind_slide").css("opacity",1).each(function(i)
				{
					var temp;
					
					if(i%2==0)
						temp="20deg";
					else
						temp="-20deg";
					
					
						$(this).delay(80*i).animate({
						  "opacity":0,
						  "rotate":temp,
						},{
							  duration:1000,
							  easing: "easeInOutSine",
							  complete: function()
							  {
									//All animation is done
									if(i==10)
										seven_animate_end();
							  }
						});
					});
				
			}
			else
			{
				handle.find(".seven_blind_slide").each(function(i)
				{									  
					$(this).find("img").css("opacity",1);
					$(this).find("img").delay(80*i).animate({
					  "opacity":0,
					},{
						  duration:500,
						  easing: "easeInQuad",
						  complete: function()
						  {
								//All animation is done
								if(i==10)
									seven_animate_end();
						  }
					});
				});
			}
		}
		function seven_circle_rotate(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var radius=Math.ceil(Math.max(option.width,option.height)/20);				
			var centerx=Math.ceil(option.width/2);
			var centery=Math.ceil(option.height/2);
			
			for(var i=10;i>=0;i--)
			{
				//calculate div pos
				var tempx,tempy;
				if((centerx-radius*(i+1))>0)
					tempx="-"+(centerx-radius*(i+1));
				else
					tempx=Math.abs(centerx-radius*(i+1));
				
				if((centery-radius*(i+1))>0)
					tempy="-"+(centery-radius*(i+1));
				else
					tempy=Math.abs(centery-radius*(i+1));
				
				if(seven_isIE()!=false&&seven_isIE()<9)
				{
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+radius*2*(i+1)+"px;height:"+radius*2*(i+1)+"px;left:"+(centerx-radius*(i+1))+"px;top:"+(centery-radius*(i+1))+"px;border-radius:"+radius*2*(i+1)+"px;'><img src='"+psrc+"' style='position:absolute;left:"+tempx+"px;top:"+tempy+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
				}
				else
				{
					blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+radius*2*(i+1)+"px;height:"+radius*2*(i+1)+"px;left:"+(centerx-radius*(i+1))+"px;top:"+(centery-radius*(i+1))+"px;border-radius:"+radius*2*(i+1)+"px;background:url("+psrc+");background-size:"+pimagewidth+"px "+pimageheight+"px;background-position: "+tempx+"px "+tempy+"px;background-repeat:no-repeat;'></div>";
				}		
		
				
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
			
			if(seven_isIE()>8||seven_isIE()==false)
			{
				var temp;
				temp=(code==0)?"20deg":"-20deg";
				handle.find(".seven_blind_slide").css("opacity",1).each(function(i)
				{				
					
						$(this).delay(80*i).animate({
						  "opacity":0,
						  "rotate":temp,
						},{
							  duration:1000,
							  easing: "easeInOutSine",
							  complete: function()
							  {
									//All animation is done
									if(i==10)
										seven_animate_end();
							  }
						});
					});
				
			}
			else
			{
				handle.find(".seven_blind_slide").each(function(i)
				{									  
					$(this).find("img").css("opacity",1);
					$(this).find("img").delay(80*i).animate({
					  "opacity":0,
					},{
						  duration:500,
						  easing: "easeInQuad",
						  complete: function()
						  {
								//All animation is done
								if(i==10)
									seven_animate_end();
						  }
					});
				});
			}
		}
		function seven_swap_block()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		
			for(var i=0;i<2;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/2);
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:"+t_height*i+"px;'><div class='seven_blind_slide' style='position:absolute;width:100%;height:"+t_height+"px;top:0px;z-index:10;'><img src='"+psrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div><div class='seven_blind_slide_temp' style='position:absolute;width:100%;height:"+t_height+"px;top:"+(t_height-2*t_height*i)+"px;'><img src='"+nsrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div></div>";		
									
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
		
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				
				//variables for Transition
				var temp;
				if(i%2==0)
					temp=Math.ceil(option.height/2);
				else
					temp=-(Math.ceil(option.height/2));
				
				$(this).find(".seven_blind_slide").animate({
					"top":temp+"px",
				},
				{
					 duration:500,
					 easing: "easeInOutSine",
					 complete: function()
					 {
						//All animation is done
						if(i==1)
							seven_animate_end();
					 }
				});
				
				$(this).find(".seven_blind_slide_temp").animate({
					 "top":"0px",
				},
				{
					  duration:500,
					  easing: "easeInOutSine",
					  complete: function()
					  {
					  }
				});		
				
			});
		}
		function seven_swap_hblock(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,-1,1,-1];
			var pease=["easeOutSine","easeOutSine","easeOutBack","easeOutBack"];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		
			for(var i=0;i<5;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/5);
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:0px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+p_arr[code]*t_width+"px;z-index:10;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:0px;z-index:10;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";		
					
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
		
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				
				//variables for Transition
				$(this).find(".seven_blind_slide").delay(i*100).animate({
					"left":"+="+(-p_arr[code]*Math.ceil(option.width/5))+"px",
				},
				{
					 duration:500,
					 easing: pease[code],
					 complete: function()
					 {
						//All animation is done
						if(i==4)
							seven_animate_end();
					 }
				});
				
			});
		}
		function seven_swap_vblock(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,-1,1,-1];
			var pease=["easeOutSine","easeOutSine","easeOutBack","easeOutBack"];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		
			for(var i=0;i<5;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/5);
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:"+t_height*i+"px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;top:"+(-p_arr[code]*t_height)+"px;z-index:10;'><img src='"+nsrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;top:0px;z-index:10;'><img src='"+psrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";		
									
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
		
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				
				//variables for Transition
				$(this).find(".seven_blind_slide").delay(i*100).animate({
					"top":"+="+(p_arr[code]*Math.ceil(option.height/5))+"px",
				},
				{
					 duration:500,
					 easing: pease[code],
					 complete: function()
					 {
						//All animation is done
						if(i==4)
						{
							if($(this).index()==0)
									seven_animate_end();
						}
					 }
				});
				
			});
		}
		function seven_tile_sequence(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,-1,0,0];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			
			for(var i=0;i<18;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/6);
				var t_height=Math.ceil(option.height/3);
				var row=i%3;
				var col=parseInt(i/3);
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+(-p_arr[code]*t_width)+"px;top:-"+t_height+"px;z-index:15;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div><div class='seven_blind_slide_temp' style='position:absolute;width:"+t_width+"px;height:"+t_height+"px;top:0px;z-index:10;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";
				
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
			handle.find(".seven_blind_slide").css("opacity",0);
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				temp=(code%2==0)?i:17-i;
				$(this).delay(60*temp).animate({
					"left":"+="+(p_arr[code]*Math.ceil(option.width/6))+"px",
					"top":"+="+Math.ceil(option.height/3)+"px",
					"opacity":"1",
				},
				{
					duration:500,
					easing:"easeOutSine",
					complete: function()
					{	
						//All animation is done
						if(temp==17)
							seven_animate_end();
					}												 
				});
			});
		}
		function seven_tile_psequence(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,-1,1,-1];
			var pfg=[0,1,-1,-1];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var sequence;
			if(code>1)
				sequence=seven_rand_generator(18);
			for(var i=0;i<18;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/6);
				var t_height=Math.ceil(option.height/3);
				var row=i%3;
				var col=parseInt(i/3);
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><div class='seven_blind_slide' style='position:absolute;width:"+t_width+"px;height:"+t_height+"px;left:"+(-p_arr[code]*t_width)+"px;top:0px;z-index:15;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div><div class='seven_blind_slide_temp' style='position:absolute;width:"+t_width+"px;height:"+t_height+"px;top:0px;z-index:10;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";
				
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
			handle.find(".seven_blind_slide").css("opacity",0);
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				if(pfg[code]==0)
					temp=i;
				else if(pfg[code]==1)
					temp=17-i;
				else
					temp=sequence[i];
				$(this).delay(60*temp).animate({
					"left":"+="+(p_arr[code]*Math.ceil(option.width/6))+"px",
					"opacity":"1",
				},
				{
					duration:500,
					easing:"easeOutSine",
					complete: function()
					{	
						//All animation is done
						if(temp==17)
							seven_animate_end();
					}												 
				});
			});
		}
		function seven_tile_random_direct(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[[-1,-1],[1,-1],[-1,1],[1,1]];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var sequence=seven_rand_generator(18);
			
			for(var i=0;i<18;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/6);
				var t_height=Math.ceil(option.height/3);
				var row=i%3;
				var col=parseInt(i/3);
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><div class='seven_blind_slide' style='position:absolute;width:"+t_width+"px;height:"+t_height+"px;left:"+(p_arr[code][0]*t_width)+"px;top:"+(p_arr[code][1]*t_height)+"px;z-index:15;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div><div class='seven_blind_slide_temp' style='position:absolute;width:"+t_width+"px;height:"+t_height+"px;top:0px;z-index:10;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";
				
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
			handle.find(".seven_blind_slide").css("opacity",0);
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				$(this).delay(60*sequence[i]).animate({
					"left":"+="+(-p_arr[code][0]*Math.ceil(option.width/6))+"px",
					"top":"+="+(-p_arr[code][1]*Math.ceil(option.height/3))+"px",
					"opacity":"1",
				},
				{
					duration:500,
					easing:"easeOutSine",
					complete: function()
					{	
						//All animation is done
						if(sequence[i]==17)
							seven_animate_end();
					}												 
				});
			});
		
		}
		function seven_htwist(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/10);		
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:"+t_height*i+"px;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;top:-"+t_height*i+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			//anim func
			handle.find(".seven_blind_slide img").each(function(i)
			{
				var temp;
				temp=(code==0)?i:9-i;
				$(this).delay(temp*50).animate({
					"width":"0",
					"left":Math.ceil(option.width/2)+"px",
				},
				{
					duration:400,
					easing:"easeInQuart",
					complete: function()
					{	
						//change the new Img 
						$(this).attr("src",nsrc);
						$(this).animate({
							"width":pimagewidth+"px",
							"left":"0px",
						},
						{
							duration:500,
							easing:"easeOutQuad",
							complete: function()
							{	
								 // All animation is done
								 if(temp==9)
									seven_animate_end();
							}												 
						});						
					}												 
				});
			});
		}
		function seven_vtwist(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/10);		
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:0px;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;left:-"+t_width*i+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			//anim func
			handle.find(".seven_blind_slide img").each(function(i)
			{
				var temp;
				temp=(code==0)?i:9-i;
				$(this).delay(temp*50).animate({
					"height":"0",
					"top":Math.ceil(option.height/2)+"px",
				},
				{
					duration:400,
					easing:"easeInQuart",
					complete: function()
					{	
						//change the new Img 
						$(this).attr("src",nsrc);
						$(this).animate({
							"height":pimageheight+"px",
							"top":"0px",
						},
						{
							duration:500,
							easing:"easeOutQuad",
							complete: function()
							{	
								 // All animation is done
								 if(temp==9)
									seven_animate_end();
							}												 
						});						
					}												 
				});
			});
		}
		function seven_chain(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,-1];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			var t_width=Math.ceil(option.width/4);
			for(var i=0;i<4;i++)
			{
				//calculate div pos
				var temp;
				if(i==0)
					temp=t_width;
				else
					temp=-t_width*(i-1);
		
				if(code==0)
					blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:0px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:100%;left:-"+t_width*2+"px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:-"+t_width*i+"px;'/></div></div>";
				else
					blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:0px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:100%;left:"+t_width+"px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:"+-t_width*(i-1)+"px;'/></div></div>";
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				var temp;
				temp=(code==0)?i:3-i;
				$(this).find(".seven_blind_slide").delay(200*temp).animate({
					"left":"+="+(p_arr[code]*t_width*2)+"px",
				},
				{
					duration:600,
					easing:"easeOutSine",
					complete: function()
					{	
						//All animation is done
						if(temp==3)
							seven_animate_end();
					}												 
				});
			});
		
		}
		function seven_schain(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,-1];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			var t_width=Math.ceil(option.width/3);
			for(var i=0;i<3;i++)
			{
				//calculate div pos
				var temp;
				if(i==0)
					temp=t_width;
				else
					temp=-t_width*(i-1);
		
				if(code==0)
					blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:0px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:100%;left:-"+t_width*2+"px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:-"+t_width*i+"px;'/></div></div>";
				else
					blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:0px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:100%;left:"+t_width+"px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:"+-t_width*(i-1)+"px;'/></div></div>";
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			if(code==0)
				handle.find(".seven_blind_subcontainer:nth-child(3)").find(".seven_blind_slide").css("left",-t_width);
			else
				handle.find(".seven_blind_subcontainer:nth-child(1)").find(".seven_blind_slide").css("left",0);
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				var temp;
				temp=(code==0)?i:2-i;
				$(this).find(".seven_blind_slide").animate({
					"left":"+="+(p_arr[code]*t_width*(2-parseInt(temp/2)))+"px",
				},
				{
					duration:800+250*temp,
					easing:"easeInOutSine",
					complete: function()
					{	
						//All animation is done
						if(temp==2)
							seven_animate_end();
					}												 
				});
			});
		
		}
		function seven_tile_random()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var pos_arr=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
			var sequence=seven_rand_generator(10);
		
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/5);
				var t_height=Math.ceil(option.height/2);
				var row=i%2;
				var col=parseInt(i/2);
				var temp=Math.floor((Math.random()*8));
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:"+t_height*2+"px;left:"+t_width*pos_arr[temp][0]*2+"px;top:"+t_height*pos_arr[temp][1]*2+"px;z-index:15;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:"+-t_width*col+"px;top:-"+t_height*row+"px;'/></div><div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;top:0px;z-index:10;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;left:"+-t_width*col+"px;top:-"+t_height*row+"px;'/></div></div>";
				
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
		
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				$(this).delay(120*sequence[i]).animate({
					"left":"0px",
					"top":"0px",
				},
				{
					duration:800,
					easing:"easeInOutQuad",
					complete: function()
					{	
						//All animation is done
						if(sequence[i]==9)
							seven_animate_end();
					}												 
				});
			});
		}
		function seven_fadezoomout()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var t_rate=3;
			
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";			
			//calculate div pos
			blind+="<div class='seven_blind_subcontainer'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;z-index:15;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";
		
			blind+="<div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div></div>";
			
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));		
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				$(this).find(".seven_blind_slide img").animate({
					"width":t_rate*pimagewidth+"px",
					"height":t_rate*pimageheight+"px",
					"left":"-"+Math.ceil((t_rate-1)*option.width/2)+"px",
					"top":"-"+Math.ceil((t_rate-1)*option.height/2)+"px",
					"opacity":0,
		
				},
				{
					duration:600,
					easing:"easeInQuad",
					complete: function()
					{	
						//All animation is done
						seven_animate_end();
					}												 
				});
				
			});
		}
		function seven_fadezoomin()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var t_rate=3;
			
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";			
			//calculate div pos
			blind+="<div class='seven_blind_subcontainer'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0;top:0;z-index:15;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth*t_rate+"px;height:"+nimageheight*t_rate+"px;left:-"+nimagewidth*parseInt((t_rate-1)/2)+"px;top:-"+nimageheight*parseInt((t_rate-1)/2)+"px;'/></div>";
		
			blind+="<div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";
			
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));		
			handle.find(".seven_blind_slide img").css("opacity",0);
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				$(this).find(".seven_blind_slide img").animate({
					"width":pimagewidth+"px",
					"height":pimageheight+"px",
					"left":"0px",
					"top":"0px",
					"opacity":1,
		
				},
				{
					duration:600,
					easing:"easeInQuad",
					complete: function()
					{	
						//All animation is done
						seven_animate_end();
					}												 
				});
		
				
				
			});
		
		}
		function seven_htail(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,-1,1,-1,1,-1,0,0];
			//initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var	sequence=seven_rand_generator(10);
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/10);					
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:"+t_height*i+"px;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;top:-"+t_height*i+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp,offset;
				var easing,time;
				if(code<2)
					temp=i;
				else if(code<4)
					temp=9-i;
				else if(code<6)
					temp=sequence[i];
				else
					temp=(code==6)?i:9-i;
				offset=(code<6)?-p_arr[code]*600:0;
				easing=(code<6)?"easeInQuad":"easeOutSine";
				time=(code<6)?600+temp*10:600;
				$(this).find("img").delay(temp*80).animate({
					"left":"+="+offset+"px",
					"opacity":0,
				},
				{
					duration:time,
					easing:easing,
					complete: function()
					{	
						 // All animation is done
						 if(temp==9)						 
							seven_animate_end(); 
					}												 
				});
			});	
		}
		function seven_vtail(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[1,1,-1,-1,1,-1,0,0];
			
			//initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
			var sequence=seven_rand_generator(10);
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/10);					
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:0px;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;left:-"+t_width*i+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp,offset;
				var easing,time;
				if(code>5)
				{
					temp=(code==6)?i:9-i;
				}
				else if(code>3)
					temp=sequence[i];
				else
				{
					if(code%2==0)
						temp=i;
					else
						temp=9-i;
				}
				offset=(code<6)?p_arr[code]*500:0;
				easing=(code<6)?"easeInQuad":"easeOutSine";
				time=(code<6)?600+temp*10:600;
				$(this).find("img").delay(temp*80).animate({
					"top":"+="+p_arr[code]*500+"px",
					"opacity":0,
				},
				{
					duration:600+temp*10,
					easing:easing,
					complete: function()
					{	
						 // All animation is done
						 if(temp==9)						 
							seven_animate_end(); 
					}												 
				});
			});	
		}
		function seven_fly(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var p_arr=[[1,0],[-1,0],[0,-1],[0,1]];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			//calculate div pos			
			blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:100%;left:"+200*p_arr[code][0]+"px;top:"+p_arr[code][1]*200+"px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			blind+="<div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
		
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			if(seven_isIE()!=false&&seven_isIE()<9)
			{
				handle.find(".seven_blind_slide img").css("opacity",0);
				handle.find(".seven_blind_slide_temp img").css("opacity",0.7);
				
				//anim func
				handle.find(".seven_blind_slide").animate({
					"left":"+="+(-p_arr[code][0]*200)+"px",
					"top":"+="+(-p_arr[code][1]*200)+"px",
				},
				{
					duration:600,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
					}												 
				});
				handle.find(".seven_blind_slide img").animate({
					"opacity":1,
		
				},
				{
					duration:600,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
					}												 
				});
				//consequent animation
				handle.find(".seven_blind_slide_temp").each(function(i)
				{
					$(this).find("img").delay(200).animate({
					"left":"+="+(-p_arr[code][0]*200)+"px",
					"top":"+="+(-p_arr[code][1]*200)+"px",
					"opacity":0,
					},
					{
						duration:800,
						easing:"easeOutSine",
						complete: function()
						{	
							 // All animation is done
							 if(i==0)
								seven_animate_end();
						}												 
					});
				});
				
		
			}
			else
			{
				handle.find(".seven_blind_slide").css("opacity",0);
				handle.find(".seven_blind_slide_temp").css("opacity",0.7);
				
				//anim func
				handle.find(".seven_blind_slide").animate({
					"left":"+="+(-p_arr[code][0]*200)+"px",
					"top":"+="+(-p_arr[code][1]*200)+"px",
					"opacity":1,
				},
				{
					duration:600,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
					}												 
				});
				//consequent animation
				handle.find(".seven_blind_slide_temp").each(function(i)
				{
					$(this).delay(200).animate({
					"left":"+="+(-p_arr[code][0]*200)+"px",
					"top":"+="+(-p_arr[code][1]*200)+"px",
					"opacity":0,
					},
					{
						duration:800,
						easing:"easeOutSine",
						complete: function()
						{	
							 // All animation is done
							 if(i==0)
								seven_animate_end();
						}												 
					});
				});
			}
		}
		function seven_rotate()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var t_rate=Math.ceil(option.width/option.height)*4+1;
			
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";			
			//calculate div pos
			blind+="<div class='seven_blind_subcontainer'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;z-index:15;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div><div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:100%;height:100%;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div></div></div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
			
			if(seven_isIE()!=false&&seven_isIE()<9)
			{
				handle.find(".seven_blind_subcontainer").each(function(i)
				{
					$(this).find(".seven_blind_slide img").animate({
						"opacity":0,
					},
					{
						duration:600,
						easing:"easeOutSine",
						complete: function()
						{	
							//animation is done
							seven_animate_end();
						}												 
					});				
				});
			}
			else
			{
				//anim func
				handle.find(".seven_blind_subcontainer").each(function(i)
				{
					$(this).find(".seven_blind_slide img").animate({
						"width":t_rate*option.width+"px",
						"height":t_rate*option.height+"px",
						"left":"-"+Math.ceil((t_rate-1)*option.width/2)+"px",
						"top":"-"+Math.ceil((t_rate-1)*option.height/2)+"px",
						"opacity":0,
						"rotate":"180deg",
		
					},
					{
						duration:1000,
						easing:"easeInOutQuad",
						complete: function()
						{	
							seven_animate_end();
						}												 
					});			
					
				});
			}
		}
		function seven_mirrow()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		
			for(var i=0;i<6;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/6);
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;width:"+t_width+"px;height:100%;overflow:hidden;left:"+t_width*i+"px;top:0px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:-"+(t_width)+"px;top:0px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:-"+t_width*i+"px'/></div><div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+(t_width)+"px;top:0px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:-"+t_width*i+"px'/></div></div>";		
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				var temp;
				if(i%2==0)
					temp=".seven_blind_slide";
				else
					temp=".seven_blind_slide_temp";
				$(this).find(temp).animate({
					"left":"0px",
				},
				{
					duration:1000,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
						if(i==5) seven_animate_end(); 
					}												 
				});
			});
			
		}
		function seven_mirrow_drag()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		
			for(var i=0;i<6;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/6);
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;width:"+t_width+"px;height:100%;overflow:hidden;left:"+t_width*i+"px;top:0px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:100%;left:-"+(t_width*2)+"px;top:0px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:-"+t_width*i+"px'/></div><div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:"+t_width*2+"px;height:100%;left:"+(t_width)+"px;top:0px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;left:-"+(t_width*i-t_width)+"px'/></div></div>";		
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				var temp;
				var temp_pos;
				if(i%2==0){
					temp=".seven_blind_slide";
					temp_pos="0px";
				}
				else{
					temp=".seven_blind_slide_temp";
					temp_pos="-"+Math.ceil(option.width/6)+"px";
				}
				$(this).find(temp).animate({
					"left":temp_pos,
				},
				{
					duration:1000,
					easing:"easeOutSine",
					complete: function()
					{	
						  // All animation is done
						if(i==5) seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_vmirrow()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		   //initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		
			for(var i=0;i<6;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/6);
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;width:100%;height:"+t_height+"px;overflow:hidden;left:0px;top:"+t_height*i+"px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:-"+t_height+"px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;top:-"+t_height*i+"px'/></div><div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:"+t_height+"px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;top:-"+t_height*i+"px'/></div></div>";		
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				var temp;
				if(i%2==0)
					temp=".seven_blind_slide";
				else
					temp=".seven_blind_slide_temp";
				$(this).find(temp).animate({
					"top":"0px",
				},
				{
					duration:700,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
						if(i==5) seven_animate_end(); 
					}												 
				});
			});
		
		}
		function seven_vmirrow_drag()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		
			for(var i=0;i<6;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/6);
				
				blind+="<div class='seven_blind_subcontainer' style='position:absolute;width:100%;height:"+t_height+"px;overflow:hidden;left:0px;top:"+t_height*i+"px;'><div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height*2+"px;left:0px;top:-"+t_height*2+"px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;top:-"+t_height*i+"px'/></div><div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:100%;height:"+t_height*2+"px;left:0px;top:"+t_height+"px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;top:-"+(t_height*i-t_height)+"px'/></div></div>";		
			}
			blind+="</div>";
			
			$(blind).insertBefore(handle.find("#seven_next"));
			//anim func
			handle.find(".seven_blind_subcontainer").each(function(i)
			{
				var temp;
				var temp_pos;
				if(i%2==0){
					temp=".seven_blind_slide";
					temp_pos="0px";
				}
				else{
					temp=".seven_blind_slide_temp";
					temp_pos="-"+Math.ceil(option.height/6)+"px";
				}
				
				$(this).find(temp).animate({
					"top":temp_pos,
				},
				{
					duration:700,
					easing:"easeOutSine",
					complete: function()
					{	
						  // All animation is done
						if(i==5) seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_flipx(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			if((seven_isIE()!=false&&seven_isIE()<9)||(window.opera))
			{
				var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+option.width+"px;height:"+option.height+"px;left:0px;top:0px;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
				blind+="</div>";
				$(blind).insertBefore(handle.find("#seven_next"));
				
				//anim func
				handle.find(".seven_blind_slide img").each(function(i)
				{
					$(this).delay(i*50).animate({
						"width":"0",
						"opacity":"0.3",
						"left":Math.ceil(option.width/2)+"px",
					},
					{
						duration:300,
						easing:"easeInSine",
						complete: function()
						{	
							//change the new Img 
							$(this).attr("src",nsrc);
							$(this).animate({
								"width":nimagewidth+"px",
								"left":"0px",
								"opacity":1,
							},
							{
								duration:300,
								easing:"easeOutSine",
								complete: function()
								{	
									 // All animation is done
									 if(i==0)
										seven_animate_end();
								}												 
							});						
						}												 
					});
				});
			}
			else
			{
				var temp=(code==0)?"left":"right";
				//prepare temp divs for transition
				blind='<div id="seven_blind_container" class="flipbox-container box100" style=position:absolute;width:100%;height:100%;z-index:30;perspective:1000;"><div  class="seven_flipbox" style="position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;">'+"<div class='seven_blind_slide' style='position:absolute;width:100%;height:100%;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>"+'</div></div>';
				$(blind).insertBefore(handle.find("#seven_next"));
				//anim func
				$(".seven_flipbox").flippy({
					direction: temp,
					duration: "750",
					verso: "<div class='seven_blind_slide' style='position:absolute;width:100%;height:100%;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>",
					onFinish:function()
					{
						//All animation is done
						seven_animate_end();
					}
				 });
			}
			
		}
		function seven_flipy(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			if((seven_isIE()!=false&&seven_isIE()<9)||(window.opera))
			{
				var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+option.width+"px;height:"+option.height+"px;left:0px;top:0px;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
				blind+="</div>";
				$(blind).insertBefore(handle.find("#seven_next"));
				
				//anim func
				handle.find(".seven_blind_slide img").each(function(i)
				{
					$(this).delay(i*50).animate({
		
						"height":"0",
						"opacity":"0.3",
						"top":Math.ceil(option.height/2)+"px",
					},
					{
						duration:300,
						easing:"easeInSine",
						complete: function()
						{	
							//change the new Img 
							$(this).attr("src",nsrc);
							$(this).animate({
								"height":nimageheight+"px",
								"top":"0px",
								"opacity":1,
							},
							{
								duration:300,
								easing:"easeOutSine",
								complete: function()
								{	
									 // All animation is done
									 if(i==0)
										seven_animate_end();
								}												 
							});						
						}												 
					});
				});
			}
			else
			{
				var temp=(code==0)?"bottom":"top";
				//prepare temp divs for transition
				blind='<div id="seven_blind_container" class="flipbox-container box100" style=position:absolute;width:100%;height:100%;z-index:30;perspective:1000;"><div  class="seven_flipbox" style="position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;">'+"<div class='seven_blind_slide' style='position:absolute;width:100%;height:100%;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>"+'</div></div>';
				$(blind).insertBefore(handle.find("#seven_next"));
				//anim func
				$(".seven_flipbox").flippy({
					direction: temp,
					duration: "750",
					verso: "<div class='seven_blind_slide' style='position:absolute;width:100%;height:100%;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>",
					onFinish:function()
					{
						//All animation is done
						seven_animate_end();
					}
				 });
			}
			
		}
		function seven_ropen(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:40'>";
			for(var i=0;i<2;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/2);
				var temp=t_height*i;
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0%;top:"+(temp)+"px;'><img src='"+psrc+"' style='position:absolute;top:-"+temp+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			if(seven_isIE()!=false&&seven_isIE()<9)
			{		
				//anim func
				handle.find(".seven_blind_slide").each(function(i)
				{
					var arr=[-option.height/2,option.height];
					$(this).animate({
						"top":arr[i],
					},
					{
						duration:400,
						easing:"easeInSine",
						complete: function()
						{	
							 // All animation is done
							 if(i==0)						 
								seven_animate_end(); 
						}												 
					});
				});
			}
			else
			{
				if(code==0)
				{
					handle.find(".seven_blind_slide:nth-child(1)").css("transform-origin","0% 100%");
					handle.find(".seven_blind_slide:nth-child(2)").css("transform-origin","0% 0");
				}
				else
				{
					handle.find(".seven_blind_slide:nth-child(1)").css("transform-origin","100% 100%");
					handle.find(".seven_blind_slide:nth-child(2)").css("transform-origin","100% 0");
				}
				//anim func
				handle.find(".seven_blind_slide").each(function(i)
				{
					var arr;
					if(code==0)
						arr=["-90deg","90deg"];
					else
						arr=["90deg","-90deg"];
					$(this).animate({
						"rotate":arr[i],
						"opacity":0,
					},
					{
						duration:800,
						easing:"easeInSine",
						complete: function()
						{	
							 // All animation is done
							 if(i==0)						 
								seven_animate_end(); 
						}												 
					});
				});
			}
			
		}
		function seven_rvopen(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:40'>";
			for(var i=0;i<2;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/2);
				var temp=t_width*i;
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+temp+"px;top:0px;'><img src='"+psrc+"' style='position:absolute;left:-"+temp+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
		
			if(seven_isIE()!=false&&seven_isIE()<9)
			{		
				//anim func
				handle.find(".seven_blind_slide").each(function(i)
				{
					var arr=[-option.width/2,option.width];
					$(this).animate({
						"left":arr[i],
					},
					{
						duration:400,
						easing:"easeInSine",
						complete: function()
						{	
							 // All animation is done
							 if(i==0)						 
								seven_animate_end(); 
						}												 
					});
				});
			}
			else
			{
				if(code==0)
				{
					handle.find(".seven_blind_slide:nth-child(1)").css("transform-origin","0% 0%");
					handle.find(".seven_blind_slide:nth-child(2)").css("transform-origin","100% 100%");
				}
				else
				{
					handle.find(".seven_blind_slide:nth-child(1)").css("transform-origin","0% 100%");
					handle.find(".seven_blind_slide:nth-child(2)").css("transform-origin","100% 0%");
				}
				//anim func
				handle.find(".seven_blind_slide").each(function(i)
				{
					var arr;
					if(code==0)
						arr=["90deg","90deg"];
					else
						arr=["-90deg","-90deg"];
					$(this).animate({
						"rotate":arr[i],
						"opacity":0,
					},
					{
						duration:800,
						easing:"easeInSine",
						complete: function()
						{	
							 // All animation is done
							 if(i==0)						 
								seven_animate_end(); 
						}												 
					});
				});
			}
		}
		function seven_4sector(code)
		{
		  var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
		  var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		  var tw=Math.ceil(option.width/2),th=Math.ceil(option.height/2);
		  //initialize for anim
		  handle.find("#seven_next").css("left","100%").css("top","0%");
		  handle.find("#seven_current").css("left","0%").css("top","0%");	
		  //prepare temp divs for transition
		  var offset=[[[-1,0],[0,1],[0,-1],[1,0]],[[0,0],[0,0],[0,0],[0,0]],[[0,0],[0,0],[0,0],[0,0]],[[-1,-1],[-1,1],[1,-1],[1,1]],[[0,0],[0,0],[0,0],[0,0]]];
		  var rotate=[[0,0,0,0],[90,-90,-90,90],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
		  var scale=[1,1,0.5,1,0.1];
		  var t_flag=[0,1,1,0,0];
		  var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		  for(var i=0;i<4;i++)
		  {
			   var col=i%2;
			   var row=parseInt(i/2);
				
			   blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+tw+"px;height:"+th+"px;left:"+row*tw+"px;top:"+col*th+"px;margin-left:"+offset[code][i][0]*tw+"px;margin-top:"+offset[code][i][1]*th+"px;'><img src='"+nsrc+"' style='position:absolute;left:-"+tw*row+"px;top:-"+th*col+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";	  
		  }
		  blind+="</div>";
		  $(blind).insertBefore(handle.find("#seven_next"));
		  handle.find(".seven_blind_slide").each(function(i)
		  {
				var col=(code<4)?i%2:0.5;
				var row=(code<4)?parseInt(i/2):0.5;
				var cache=(t_flag[code]==1)?$(this).find("img"):$(this);
				cache.css("opacity",0).rotate(rotate[code][i]+"deg").css("transform-origin",100*col+"% "+100*row+"%").scale(scale[code]);
				cache.delay(300*i).animate({
					"marginLeft":0,
					"marginTop":0,
					"rotate":"0deg",
					"opacity":1,
					"scale":1,
				},
				{
					duration:800,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
						if(i==3) seven_animate_end(); 
					}												 
				});
		  });
		}
		function seven_4sector_fade(code)
		{
		  var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
		  var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		  var tw=Math.ceil(option.width/2),th=Math.ceil(option.height/2);
		  //initialize for anim
		  handle.find("#seven_next").css("left","0%").css("top","0%");
		  handle.find("#seven_current").css("left","100%").css("top","0%");	
		  //prepare temp divs for transition
		  var offset=[[[-1,0],[0,1],[0,-1],[1,0]],[[0,0],[0,0],[0,0],[0,0]],[[0,0],[0,0],[0,0],[0,0]],[[-1,-1],[-1,1],[1,-1],[1,1]],[[0,0],[0,0],[0,0],[0,0]]];
		  var rotate=[[0,0,0,0],[90,-90,-90,90],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
		  var scale=[1,1,0.5,1,0.1];
		  var t_flag=[0,1,1,0,0];
		  var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		  for(var i=0;i<4;i++)
		  {
			   var col=i%2;
			   var row=parseInt(i/2);
				
			   blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+tw+"px;height:"+th+"px;left:"+row*tw+"px;top:"+col*th+"px;'><img src='"+psrc+"' style='position:absolute;left:-"+tw*row+"px;top:-"+th*col+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";	  
		  }
		  blind+="</div>";
		  $(blind).insertBefore(handle.find("#seven_next"));
		  handle.find(".seven_blind_slide").each(function(i)
		  {
				var col=(code<4)?i%2:0.5;
				var row=(code<4)?parseInt(i/2):0.5;
				var cache=(t_flag[code]==1)?$(this).find("img"):$(this);
				var ttime=(code!=3)?200*i:0;
				cache.css("transform-origin",100*col+"% "+100*row+"%");
				cache.delay(ttime).animate({
					"marginLeft":offset[code][i][0]*tw+"px",
					"marginTop":offset[code][i][1]*th+"px",
					"rotate":rotate[code][i]+"deg",
					"opacity":"0",
					"scale":scale[code],
				},
				{
					duration:800,
					easing:"easeInSine",
					complete: function()
					{	
						 // All animation is done
						if(i==3) seven_animate_end(); 
					}												 
				});
		  });
		}
		function seven_page(code)
		{
		  var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
		  var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		  var p_arr=[[0,-1],[0,-1],[0,-1],[0,-1],[0,1],[0,1],[0,1],[0,1]];
		  var rotate=[-90,-90,90,90,90,90,-90,-90];
		  //initialize for anim
		  handle.find("#seven_next").css("left","100%").css("top","0%");
		  handle.find("#seven_current").css("left","0%").css("top","0%");	
		
		  //prepare temp divs for transition
		  var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		  //calculate div pos			
		  blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
		  blind+="<div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";	
		  blind+="</div>";
		  $(blind).insertBefore(handle.find("#seven_next"));
		  
		  if(seven_isIE()!=false&&seven_isIE()<9)
			{
				handle.find(".seven_blind_slide img").css("opacity",0);
				handle.find(".seven_blind_slide_temp img").css("opacity",0.7);
				
				//anim func
				handle.find(".seven_blind_slide img").animate({
					"opacity":1,
		
				},
				{
					duration:600,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
					}												 
				});
				//consequent animation
				handle.find(".seven_blind_slide_temp").each(function(i)
				{
					$(this).find("img").delay(200).animate({
					"left":"+="+(-p_arr[code][0]*200)+"px",
					"top":"+="+(-p_arr[code][1]*200)+"px",
					"opacity":0,
					},
					{
						duration:800,
						easing:"easeOutSine",
						complete: function()
						{	
							 // All animation is done
							 if(i==0)
								seven_animate_end();
						}												 
					});
				});
				
		
			}
			else
			{
			  var col=code%2,row=parseInt(code/2)%2;
			  handle.find(".seven_blind_slide").css("opacity",0).css("transform-origin",row*100+"% "+col*100+"%").rotate(rotate[code]+"deg");
			  handle.find(".seven_blind_slide_temp").css("opacity",0.7);
			
			  //anim func
			  handle.find(".seven_blind_slide").animate({
				"rotate":"0deg",
				"opacity":1,
			  },
			  {
				duration:600,
				easing:"easeOutSine",
				complete: function()
				{	
					 // All animation is done
				}												 
			  });
			  //consequent animation
			  handle.find(".seven_blind_slide_temp").each(function(i)
			  {
				$(this).delay(500).animate({
				"left":"+="+(-p_arr[code][0]*200)+"px",
				"top":"+="+(-p_arr[code][1]*200)+"px",
				"opacity":0,
				},
				{
					duration:800,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
						 if(i==0)
							seven_animate_end();
					}												 
				});
			  });
			}
		}
		function seven_page(code)
		{
		  var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
		  var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		  var p_arr=[[0,-1],[0,-1],[0,-1],[0,-1],[0,1],[0,1],[0,1],[0,1]];
		  var rotate=[-90,-90,90,90,90,90,-90,-90];
		  //initialize for anim
		  handle.find("#seven_next").css("left","100%").css("top","0%");
		  handle.find("#seven_current").css("left","0%").css("top","0%");	
		
		  //prepare temp divs for transition
		  var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		  //calculate div pos			
		  blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
		  blind+="<div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";	
		  blind+="</div>";
		  $(blind).insertBefore(handle.find("#seven_next"));
		  
		  if(seven_isIE()!=false&&seven_isIE()<9)
			{
				handle.find(".seven_blind_slide img").css("opacity",0);
				handle.find(".seven_blind_slide_temp img").css("opacity",0.7);
				
				//anim func
				handle.find(".seven_blind_slide img").animate({
					"opacity":1,
		
				},
				{
					duration:600,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
					}												 
				});
				//consequent animation
				handle.find(".seven_blind_slide_temp").each(function(i)
				{
					$(this).find("img").delay(200).animate({
					"left":"+="+(-p_arr[code][0]*200)+"px",
					"top":"+="+(-p_arr[code][1]*200)+"px",
					"opacity":0,
					},
					{
						duration:800,
						easing:"easeOutSine",
						complete: function()
						{	
							 // All animation is done
							 if(i==0)
								seven_animate_end();
						}												 
					});
				});
				
		
			}
			else
			{
			  var col=code%2,row=parseInt(code/2)%2;
			  handle.find(".seven_blind_slide").css("opacity",0).css("transform-origin",row*100+"% "+col*100+"%").rotate(rotate[code]+"deg");
			  handle.find(".seven_blind_slide_temp").css("opacity",0.7);
			
			  //anim func
			  handle.find(".seven_blind_slide").animate({
				"rotate":"0deg",
				"opacity":1,
			  },
			  {
				duration:600,
				easing:"easeOutSine",
				complete: function()
				{	
					 // All animation is done
				}												 
			  });
			  //consequent animation
			  handle.find(".seven_blind_slide_temp").each(function(i)
			  {
				$(this).delay(500).animate({
				"left":"+="+(-p_arr[code][0]*200)+"px",
				"top":"+="+(-p_arr[code][1]*200)+"px",
				"opacity":0,
				},
				{
					duration:800,
					easing:"easeOutSine",
					complete: function()
					{	
						 // All animation is done
						 if(i==0)
							seven_animate_end();
					}												 
				});
			  });
			}
		}
		function seven_carousel(code)
		{
		  var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
		  var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		  var trate=option.width/parseInt(handle.attr("o-width"));	  
		  var p_offset=[[-500,0],[500,0],[0,-300],[0,300],[-500,0],[-500,0],[500,0],[500,0],[0,0]];
		  var t_origin=[[50,50],[50,50],[50,50],[50,50],[100,0],[100,100],[0,0],[0,100],[50,50]];
		  //initialize for anim
		  handle.find("#seven_next").css("left","100%").css("top","0%");
		  handle.find("#seven_current").css("left","100%").css("top","0%");	
		  //prepare temp divs for transition
		  var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		  var th=Math.ceil(option.height/1);	  
		  for(var i=0;i<1;i++)
		  {		
			   blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+th+"px;left:0px;top:"+th*i+"px;z-index:30;'><img src='"+psrc+"' style='position:absolute;width:"+pimagewidth+"px;height:"+pimageheight+"px;top:-"+th*i+"px;'/></div>";		
		  blind+="<div class='seven_blind_slide_temp' style='position:absolute;overflow:hidden;width:100%;height:"+th+"px;left:0px;top:"+th*i+"px;z-index:10;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;top:-"+th*i+"px;'/></div>";
		  }
		  blind+="</div>";		
		  $(blind).insertBefore(handle.find("#seven_next"));
		  handle.find(".seven_blind_slide_temp img").css("marginLeft",-p_offset[code][0]*trate).css("marginTop",-p_offset[code][1]*trate).scale(0.4).css("opacity",0).css("transform-origin",t_origin[code][0]+"% "+t_origin[code][1]+"%");
		  //consequent animation
		  handle.find(".seven_blind_slide").each(function(i)
		  {
				$(this).find("img").delay(60).animate({
				"marginLeft":p_offset[code][0]*trate+"px",
				"marginTop":p_offset[code][1]*trate+"px",
				"scale":"0.6",
				"opacity":"0",
				},
				{
					duration:800,
					easing:"easeOutSine",
					complete: function()
					{	
		
					}												 
				});
		  });
		  handle.find(".seven_blind_slide_temp").each(function(i){
				$(this).find("img").animate({
				"marginLeft":"0",
				"marginTop":"0px",
				"scale":"1",
				"opacity":"1",
			  },
			  {
				duration:800,
				easing:"easeOutSine",
				complete: function()
				{	
					 // All animation is done
					 if(i==0)
						seven_animate_end();
				}
			  });
		 });
		}
		function seven_emerge(code)
		{
		  var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
		  var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
		  var p_offset=[[-1,0],[1,0],[0,-1],[0,1],[-1,0],[1,0],[0,-1],[0,1],[-1,0],[1,0],[0,-1],[0,1]];
		  var rotate=[0,0,0,0,-90,90,-60,60];
		  var easing=(code<8)?"easeOutSine":"easeOutBounce";
		  //initialize for anim
		  handle.find("#seven_next").css("left","100%").css("top","0%");
		  handle.find("#seven_current").css("left","0%").css("top","0%");	
		  //prepare temp divs for transition
		  var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
		  //calculate div pos			
		  blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:100%;left:0px;top:0px;'><img src='"+nsrc+"' style='position:absolute;width:"+nimagewidth+"px;height:"+nimageheight+"px;margin-left:"+p_offset[code][0]*option.width+"px;margin-top:"+p_offset[code][1]*option.height+"px;'/></div>";			
		  blind+="</div>";
		  $(blind).insertBefore(handle.find("#seven_next"));
		  handle.find(".seven_blind_slide img").css("opacity",0).rotate(rotate[code]+"deg");
		  handle.find(".seven_blind_slide img").delay(250).animate({
			 "marginLeft":"0px",
			 "marginTop":"0px",
			 "rotate":"0deg",
			 "opacity":"1",
		  },
		  {
			 duration:800,
			 easing:easing,
			 complete: function()
			 {	
				 seven_animate_end();
			 }												 
		  });
		  
		}
		function seven_fancy_rect(code)
		{
		   var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
		   var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var sequence=[[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],[0,6,12,18,1,7,13,19,2,8,14,20,3,9,15,21,4,10,16,22,5,11,17,23],[0,11,12,23,1,10,13,22,2,9,14,21,3,8,15,20,4,7,16,19,5,6,17,18],[0,1,2,3,7,6,5,4,8,9,10,11,15,14,13,12,16,17,18,19,23,22,21,20],[0,15,14,13,1,16,23,12,2,17,22,11,3,18,21,10,4,19,20,9,5,6,7,8],[12,8,8,12,8,4,4,8,4,0,0,4,4,0,0,4,8,5,5,8,12,8,8,12],[0,2,5,9,1,4,8,13,3,7,12,17,6,11,16,20,10,15,19,22,14,18,21,23],[0,11,12,23,10,1,22,13,2,9,14,21,8,3,20,15,4,7,16,19,6,5,18,17],[0,9,8,6,10,1,7,5,3,11,2,4,4,2,11,3,5,7,1,10,6,8,9,0],[6,12,18,22,2,7,13,19,0,3,8,14,1,4,9,15,5,10,16,20,11,17,21,23]];
			var endpoint=[23,23,3,20,6,0,23,3,9,23];
		   //initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var t_width=Math.ceil(option.width/6);
			var t_height=Math.ceil(option.height/4);				
			for(var i=0;i<24;i++)
			{
				//calculate div pos
				var row=i%4;
				var col=parseInt(i/4);
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{	
				$(this).delay(80*sequence[code][i]).animate({
					"scale":0.3,
				},
				{
					duration:350,
					easing:"easeInSine",
					complete: function()
					{
						 // All animation is done
						 if(i==endpoint[code]) 
							seven_animate_end(); 
					}
				});
				$(this).find("img").delay(80*sequence[code][i]).animate({
						"opacity":0,										
				},
				{
						duration:350,
						easing:"easeOutSine"
				});
			});	
		  
		}
		function seven_fancy_rect_emerge(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var sequence=[[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],[0,6,12,18,1,7,13,19,2,8,14,20,3,9,15,21,4,10,16,22,5,11,17,23],[0,11,12,23,1,10,13,22,2,9,14,21,3,8,15,20,4,7,16,19,5,6,17,18],[0,1,2,3,7,6,5,4,8,9,10,11,15,14,13,12,16,17,18,19,23,22,21,20],[0,15,14,13,1,16,23,12,2,17,22,11,3,18,21,10,4,19,20,9,5,6,7,8],[12,8,8,12,8,4,4,8,4,0,0,4,4,0,0,4,8,5,5,8,12,8,8,12],[0,2,5,9,1,4,8,13,3,7,12,17,6,11,16,20,10,15,19,22,14,18,21,23],[0,11,12,23,10,1,22,13,2,9,14,21,8,3,20,15,4,7,16,19,6,5,18,17],[0,9,8,6,10,1,7,5,3,11,2,4,4,2,11,3,5,7,1,10,6,8,9,0],[6,12,18,22,2,7,13,19,0,3,8,14,1,4,9,15,5,10,16,20,11,17,21,23]];
			var endpoint=[23,23,3,20,6,0,23,3,9,23];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var t_width=Math.ceil(option.width/6);
			var t_height=Math.ceil(option.height/4);				
			for(var i=0;i<24;i++)
			{
				//calculate div pos
				var row=i%4;
				var col=parseInt(i/4);
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			//anim func
			handle.find(".seven_blind_slide").scale(1.5);
			handle.find(".seven_blind_slide").find("img").css("opacity",0);
			handle.find(".seven_blind_slide").each(function(i)
			{	
				$(this).delay(80*sequence[code][i]).animate({
					"scale":1,
				},
				{
					duration:350,
					easing:"easeInSine",
					complete: function()
					{
						 // All animation is done
						 if(i==endpoint[code]) 
							seven_animate_end(); 
					}
				});
				$(this).find("img").delay(80*sequence[code][i]).animate({
						"opacity":1,										
				},
				{
						duration:350,
						easing:"easeOutSine"
				});
			});		  
		}
		function seven_door(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var toffset=[[0,1],[0,1],[1,0],[1,0]];
			var angle=[0,-90,0,-40];
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:40'>";
			var t_width=Math.ceil(option.width/2);				
			var t_height=Math.ceil(option.height/2);		
			var tsize=[[option.width,t_height],[option.width,t_height],[t_width,option.height],[t_width,option.height]];		
			for(var i=0;i<2;i++)
			{
				//calculate div pos
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+tsize[code][0]+"px;height:"+tsize[code][1]+"px;left:"+toffset[code][0]*(t_width*i)+"px;top:"+toffset[code][1]*(t_height*i)+"px;margin-left:"+toffset[code][0]*(t_width*(2*i-1))+"px;margin-top:"+toffset[code][1]*(t_height*(2*i-1))+"px;'><img src='"+nsrc+"' style='position:absolute;left:-"+toffset[code][0]*t_width*i+"px;top:-"+toffset[code][1]*t_height*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				$(this).rotate(angle[code]+"deg").css("transform-origin",100*i+"% "+100*i+"%").css("opacity",0);
				$(this).animate({
					"marginLeft":0,
					"marginTop":0,	
					"opacity":1,
					"rotate":"0deg",
				},
				{
					duration:1800,
					easing:"easeOutBounce",
					complete: function()
					{	
						 // All animation is done
						 if(i==0)						 
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_skew(code)
		{
			
			var p_arr=[[100,0,0,0],[-100,0,0,0],[0,100,0,0],[0,-100,0,0]];
			var t_arr=[[-option.width,0],[option.width,0],[0,-option.height],[0,option.height]];
			//initialize for anim
			handle.find("#seven_next").css("left",p_arr[code%4][0]+"%").css("top",p_arr[code%4][1]+"%");
			handle.find("#seven_current").css("left",p_arr[code%4][2]+"%").css("top",p_arr[code%4][3]+"%");
			//anim func
			$("#seven_next").anima({skewX: 20-40*parseInt(code/4), skewY: 20-40*parseInt(code/4),"x":t_arr[code%4][0]+"px","y":t_arr[code%4][1]+"px"}, 800,"easeInQuad").anima({skew: "0deg, 0deg",x:t_arr[code%4][0]+"px","y":t_arr[code%4][1]+"px"}, 400,{
			complete:function(){
					$(this).css("transform","").css("transition","");	
					seven_animate_end();
			}});
		}
		function seven_square_push(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","0%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
		
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			var sequence=seven_rand_generator(20);
			var tarray=[[-1,0],[0,1],[1,0],[0,-1]];
			for(var i=0;i<20;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/5);
				var t_height=Math.ceil(option.height/4);
				var row=parseInt(i/5);
				var col=i%5;
				var rand=(code<2)?Math.round(Math.random()*3):code-2;		
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:"+t_height+"px;left:"+t_width*col+"px;top:"+t_height*row+"px;'><div class='seven_blind_sub seven_func_blind' style='position:absolute;width:"+t_width+"px;height:"+t_height+"px;overflow:hidden;margin-left:"+tarray[rand][0]*t_width+"px;margin-top:"+tarray[rand][1]*t_height+"px;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div><div class='seven_blind_sub' style='position:absolute;left:0px;top:0px;width:"+t_width+"px;height:"+t_height+"px;overflow:hidden;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*col+"px;top:-"+t_height*row+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
				
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var offsetx,offsety;
				var delay,index;
				if(code==0)		delay=sequence[i];
				else if(code==1)	delay=0;
				else delay=i;
				index=(code<2)?sequence[i]:i;
				
				offsetx=-parseInt($(this).find(".seven_func_blind").css("marginLeft"));
				offsety=-parseInt($(this).find(".seven_func_blind").css("marginTop"));
				$(this).find(".seven_blind_sub").delay(80*delay).animate({
					"marginLeft":"+="+offsetx+"px",
					"marginTop":"+="+offsety+"px",
				},
				{
					duration:600,
					easing:"easeInOutQuad",
					complete: function()
					{	
						 // All animation is done
						 if(index==19)
							seven_animate_end(); 
					}												 
				});
			});
		}
		function seven_row_carousel(code)
		{
			if(seven_isIE()!=false&&seven_isIE()<9)
			{
				seven_vbar_rmove(0);
				return false;
			}
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
			var sequence=seven_rand_generator(4);
			//prepare temp divs for transition
			var t_width=Math.ceil(option.width/4);	
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			for(var i=0;i<4;i++)
			{
				//calculate div pos				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+t_width*i+"px;top:0px;'><div class='seven_func_blind' style='position:absolute;width:"+t_width+"px;height:100%;overflow:hidden;margin-left:"+(t_width/2-t_width*(code%2))+"px;'><img src='"+nsrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div><div class='seven_blind_sub' style='position:absolute;left:0px;top:0px;width:"+t_width+"px;height:100%;overflow:hidden;'><img src='"+psrc+"' style='position:absolute;left:-"+t_width*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			handle.find(".seven_func_blind").scale(0.8).css("opacity",0);
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				temp=(code<2)?i:3-i;
				$(this).find(".seven_func_blind").delay(temp*80+30).animate({
					"marginLeft":"0px",
					"scale":1,
					"opacity":1,
				},
				{
					duration:600,
					easing:"easeInOutQuad",
					complete: function()
					{	
						if(temp==3)
						{
							seven_animate_end();
						}
					}												 
				});
				$(this).find(".seven_blind_sub").delay(temp*80).animate({
					"marginLeft":(-t_width/2+t_width*(code%2))+"px",
					"scale":0.8,
					"opacity":0,
				},
				{
					duration:600,
					easing:"easeOutSine",
					complete: function()
					{	
						
					}												 
				});
			});	
		}
		function seven_col_carousel(code)
		{
			if(seven_isIE()!=false&&seven_isIE()<9)
			{
				seven_hbar_rmove(0);
				return false;
			}
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","100%").css("top","0%");	
			var sequence=seven_rand_generator(4);
			//prepare temp divs for transition
			var t_height=Math.ceil(option.height/4);	
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:30'>";
			for(var i=0;i<4;i++)
			{
				//calculate div pos				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:"+t_height*i+"px;'><div class='seven_func_blind' style='position:absolute;width:100%;height:"+t_height+"px;overflow:hidden;margin-left:"+(option.width/2-option.width*(code%2))+"px;'><img src='"+nsrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div><div class='seven_blind_sub' style='position:absolute;left:0px;top:0px;width:100%;height:"+t_height+"px;overflow:hidden;'><img src='"+psrc+"' style='position:absolute;top:-"+t_height*i+"px;width:"+pimagewidth+"px;height:"+pimageheight+"px;'/></div></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			
			handle.find(".seven_func_blind").scale(0.7).css("opacity",0);
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp;
				temp=(code<2)?i:3-i;
				$(this).find(".seven_func_blind").delay(temp*80+30).animate({
					"marginLeft":"0px",
					"scale":1,
					"opacity":1,
				},
				{
					duration:600,
					easing:"easeInOutQuad",
					complete: function()
					{	
						if(temp==3)
						{
							seven_animate_end();
						}
					}												 
				});
				$(this).find(".seven_blind_sub").delay(temp*80).animate({
					"marginLeft":(-option.width/2+option.width*(code%2))+"px",
					"scale":0.7,
					"opacity":0,
				},
				{
					duration:600,
					easing:"easeOutSine",
					complete: function()
					{	
						
					}												 
				});
			});	
		}
		function seven_hbar_shade(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
			
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			for(var i=0;i<6;i++)
			{
				//calculate div pos
				var t_height=Math.ceil(option.height/6);
				var temp=t_height*i;
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:100%;height:"+t_height+"px;left:0px;top:"+temp+"px;'><img src='"+nsrc+"' style='position:absolute;top:-"+temp+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			var arr=[[180,0],[180,0],[180,180]];	
			handle.find(".seven_blind_slide").css("opacity",0);
			handle.find(".seven_blind_slide").css("perspective", "1000px");
			handle.find(".seven_blind_slide").parent().css("perspective", "1000px");
			handle.find(".seven_blind_slide").css("transform","rotateX("+arr[code][0]+"deg)").css("transform","rotateY("+arr[code][1]+"deg)");
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp=(code%2==0)?i:0;
				$(this).delayAnima(80*temp).anima({perspective: "1000px", rotateX: "0deg", rotateY: "0deg","opacity":1}, 1200,{
				complete:function(){
					$(this).stopAnima();
					if(i==5)
						seven_animate_end();
				}
				});		
			});
		}
		function seven_vbar_shade(code)
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			//initialize for anim
			handle.find("#seven_next").css("left","100%").css("top","0%");
			handle.find("#seven_current").css("left","0%").css("top","0%");	
			
			//prepare temp divs for transition
			var blind="<div id='seven_blind_container' style='position:absolute;width:100%;height:100%;z-index:20'>";
			for(var i=0;i<10;i++)
			{
				//calculate div pos
				var t_width=Math.ceil(option.width/10);
				var temp=t_width*i;
				
				blind+="<div class='seven_blind_slide' style='position:absolute;overflow:hidden;width:"+t_width+"px;height:100%;left:"+temp+"px;top:0px;'><img src='"+nsrc+"' style='position:absolute;left:-"+temp+"px;width:"+nimagewidth+"px;height:"+nimageheight+"px;'/></div>";		
			}
			blind+="</div>";
			$(blind).insertBefore(handle.find("#seven_next"));
			var arr=[[0,180],[0,180],[180,180]];	
			handle.find(".seven_blind_slide").css("opacity",0);
			handle.find(".seven_blind_slide").css("perspective", "1000px");
			handle.find(".seven_blind_slide").parent().css("perspective", "1000px");
			handle.find(".seven_blind_slide").css("transform","rotateX("+arr[code][0]+"deg)").css("transform","rotateY("+arr[code][1]+"deg)");
			//anim func
			handle.find(".seven_blind_slide").each(function(i)
			{
				var temp=(code%2==0)?i:0;
				$(this).delayAnima(80*temp).anima({rotateX: "0deg", rotateY: "0deg","opacity":1}, 1200,{
				complete:function(){
					$(this).stopAnima();
					if(i==9)
						seven_animate_end();
				}
				});		
			});
		}
		function seven_blur()
		{
			var pimagewidth=handle.find("#seven_current .seven_image").width(),pimageheight=handle.find("#seven_current .seven_image").height(),psrc=handle.find("#seven_current .seven_image").attr("src");
			var nimagewidth=handle.find("#seven_next .seven_image").width(),nimageheight=handle.find("#seven_next .seven_image").height(),nsrc=handle.find("#seven_next .seven_image").attr("src");
			var current=handle.find("#seven_current");
			var next=handle.find("#seven_next");
			handle.find("#seven_viewport").css("background","#fff");
			//initialize for anim
			next.css("left","0%").css("top","0%").css("opacity",0);
			current.css("left","0%").css("top","0%");
			var vague = current.Vague({intensity:0});
			var temp=0,rtemp=20,flag=0,globalID;
				function vague_func() {
				  if(temp>20)
				  {	
					flag=1;
				  }
				  if(rtemp==0)
				  {
					 flag=2;
					 current.css("filter","");
					 next.css("filter","").css("opacity",1);
					 seven_animate_end();
				  }
				  if(flag==0)
				  {
					temp+=2;
					current.Vague({intensity:temp})
					vague.blur();
				  }
				  if(flag==1)
				  {
					if(rtemp>0) rtemp-=2.5;
					next.css("opacity",1-parseFloat(rtemp/20)).Vague({intensity:rtemp});
					current.Vague({intensity:rtemp});
					vague.blur();
				  }
				  if(flag<2)
				  	globalID = requestAnimationFrame(vague_func);
				}
				vague_func();
			}
		//end animate 
		function seven_animate_end()
		{
			var opacity;
			handle.css("background-color","#000");
			handle.find("#seven_blind_container").remove();
			handle.find(".seven_cube").remove();
			handle.find(".seven_operate").stop();
			handle.find("#seven_current").css("left",0).css("top",0);
			handle.find("#seven_next").css("left","100%").css("top","0%");
			//set current slide
			current_index=target_index;
			seven_set_current_slide(current_index);
			seven_caption_end_animate();
		}
		//start autoplay
		function seven_start()
		{
			  if(lock==1)
					return;
			  var cache=handle.find(".progressbar");
			  cache.show();	  
			  if(!cache.hasClass("on"))
			  {
				  cache.addClass("on");
				  switch(option.progressbartype)
				  {
					  case 'linear':
							timer=setInterval(seven_linear_automate,50);
							handle.find("#lprogress").css("width",t_val);
					  break;
					  case 'circle':
							timer=setInterval(seven_circle_automate,50);		  
							handle.find('.cprogress').val(t_val).trigger('change'); 
					  break;
				  }
			}
		}
		//pause autoplay
		function seven_pause()
		{
			clearInterval(timer);
			handle.find(".progressbar").removeClass("on");
		}
		//stop autoplay
		function seven_stop()
		{
			clearInterval(timer);
			handle.find(".progressbar").hide();
			handle.find(".progressbar").removeClass("on");
			t_val=0;
		}
		//show lightbox
		function seven_lightbox_setup()
		{
			if(option.lightbox==true&&handle.find("#seven_lightbox").size()<1)
			{
				a_flag=0;
				handle.find(".seven_a_play").addClass("seven_a_pause");
				seven_stop();
				var attr=$(".seven_slide:nth-child("+(current_index+1)+")");
				var size=seven_get_imagesize(attr);
				var width=option.width;
				var height=option.height;
				handle.append("<div id='seven_lightbox'><div id='seven_lightbox_overlay'></div><div id='seven_sublightbox'><div id='seven_lightbox_control_close'></div><div id='seven_lightbox_control_prev' class='seven_lcontrol'></div><div id='seven_lightbox_control_next' class='seven_lcontrol'></div><div id='seven_lviewport'></div></div></div>");
				handle.find("#seven_lightbox").append("<div id='seven_lightbox_thumb' class=''><div id='seven_subboard'><div id='seven_thumb_container'></div></div></div>");				
				handle.find(".seven_slide").each(function(i)
				{
					var src=$(this).find(".seven_image").attr("data-src");
					if(i==current_index)
					  handle.find("#seven_thumb_container").append("<div class='seven_thumb active'><div class='seven_subthumb'><img class='seven_thumb_img' src='"+$(this).find(".seven_image").attr("src")+"' data-src='"+src+"'/></div></div>");
					else
					  handle.find("#seven_thumb_container").append("<div class='seven_thumb'><div class='seven_subthumb'><img class='seven_thumb_img' src='"+$(this).find(".seven_image").attr("src")+"' data-src='"+src+"'/></div></div>");
					
				});
				handle.find("#seven_thumb_container").css("width",54*length);
				handle.find("#seven_lviewport").html(attr.html());
				if(seven_isIE()!=false&&seven_isIE()<9)
				{
					handle.find("#seven_sublightbox").css("width",width).css("height",height).css("marginLeft",(-width/2)).css("marginTop",-height/2).css("opacity",0);
					handle.find("#seven_sublightbox").animate({
						"opacity":1,
					},
					{
						duration:400,
						easing:"easeOutSine"
					});
				}
				else
				{
					handle.find("#seven_sublightbox").css("width",width).css("height",height).css("marginLeft",-width/2).css("marginTop",-height/2).css("opacity",0).scale(0.5);
					handle.find("#seven_sublightbox").animate({
						"opacity":1,
						"scale":1,
					},
					{
						duration:400,
						easing:"easeOutSine"
					});
				}
/*				handle.find(".seven_thumb").find(".seven_thumb_img").greyScale({
				  // call the plugin with non-defult fadeTime (default: 400ms)
				  fadeTime: 500,
				  reverse: false
				});*/
			}
		}
		//swipe function
		function seven_swipe_function(e)
		{
			if(option.swipe==true&&mpflag==1)
			{
				var offsetx=offsety=0;
				var direction=-1;
				offsetx=e[0]-mp_temp[0];
				offsety=e[1]-mp_temp[1];
				mpflag=0;
				if(Math.abs(offsetx)>2||Math.abs(offsety)>2)
				{
					switch(sd_flag)
					{
						//horizontal swipe
						case 1:
							if(offsetx>2) 
								direction=0;
							else if(offsetx<-2)
								direction=1;
							else
							{
								sd_flag=0;
								handle.find(".seven_operate").css("marginLeft",0).css("marginTop",0);
								handle.find("#seven_prev").css("left","-100%").css("top","0");
								handle.find("#seven_next").css("left","100%").css("top","0");
							}
							//lock the key
							if(direction>-1)
							{
								lock=1;
								handle.find(".seven_operate").each(function(i){
									$(this).animate({
									"marginLeft":option.width-2*option.width*direction+"px",
									},
									{
										duration:800,
										easing:"easeOutSine",
										complete: function()
										{
											if(i==2)
											{
												current_index=(direction==1)?(current_index+1)%length:(current_index==0)?length-1:current_index-1;;
												seven_swipe_end();
											}
										}
									});
								});
							}
						break;
						//vertical swipe
						case 2:
							if(offsety>2) 
								direction=0;
							else if(offsety<-2)
								direction=1;
							else
							{
								sd_flag=0;
								handle.find(".seven_operate").css("marginLeft",0).css("marginTop",0);
								handle.find("#seven_prev").css("left","-100%").css("top","0");
								handle.find("#seven_next").css("left","100%").css("top","0");
							}
							//lock the key
							if(direction>-1)
							{
								lock=1;
								handle.find(".seven_operate").each(function(i){
									$(this).animate({
									"marginTop":option.height-2*option.height*direction+"px",
									},
									{
										duration:800,
										easing:"easeOutSine",
										complete: function()
										{
											if(i==2)
											{
												current_index=(direction==1)?(current_index+1)%length:(current_index==0)?length-1:current_index-1;;
												seven_swipe_end();
											}
										}
									});
								});
							}
						break;
					}
				}
				else
				{
					sd_flag=0;
					handle.find(".seven_operate").css("marginLeft",0).css("marginTop",0);
					handle.find("#seven_prev").css("left","-100%").css("top","0");
					handle.find("#seven_next").css("left","100%").css("top","0");
					if(a_flag==1) seven_start();
				//	seven_lightbox_setup();
				}
			}
		}
		//swipe end process
		function seven_swipe_end()
		{
			seven_set_current_slide(current_index);
			handle.find(".seven_operate").css("marginLeft",0).css("marginTop",0);
			handle.find("#seven_prev").css("left","-100%").css("top","0").css("marginLeft",0).css("marginTop",0);
			handle.find("#seven_next").css("left","100%").css("top","0").css("marginLeft",0).css("marginTop",0);
			//adjust carousel Pos
			handle.find(".seven_circle").removeClass("active");
			handle.find(".carousel").removeClass("active");
			handle.find(".seven_circle:nth-child("+(current_index+1)+")").addClass("active");
			handle.find(".carousel:nth-child("+(current_index+1)+")").addClass("active");
			target_index=current_index;
			if(option.carousel!=false)
			{
				c_flag=0;
				seven_adjust_carousel(current_index);
			}
			seven_respond();
			lock=0;
			sd_flag=0;
			if(a_flag==1) seven_start();
		}
		function seven_lightbox_slide(index)
		{
			if(handle.find("#seven_sublightbox_temp").length>0) return false;
			var width=option.width,height=option.height;
			var attr=$(".seven_slide:nth-child("+(index+1)+")");
			handle.find("#seven_sublightbox").append("<div id='seven_sublightbox_temp'></div>");
			handle.find("#seven_sublightbox_temp").html(attr.html());
			handle.find("#seven_sublightbox_temp").find(".seven_image").css("width",option.width);
			handle.find("#seven_sublightbox_temp").css("marginLeft",-80).css("opacity",0);
			handle.find(".seven_thumb").removeClass("active");
			handle.find(".seven_thumb:nth-child("+(index+1)+")").addClass("active");
			handle.find("#seven_sublightbox_temp").animate({
				'opacity':1,
				'marginLeft':"+=80px"
			},
			{
				duration:400,
				easing:"easeOutSine"
			});
			handle.find("#seven_lviewport").animate({
				'opacity':0,
				'marginLeft':"+=80px"
			},
			{
				duration:400,
				easing:"easeOutSine",
				complete:function()
				{
					handle.find("#seven_lviewport").remove();					
					handle.find("#seven_sublightbox_temp").stop().css("marginLeft","").css("marginTop","").attr("id","seven_lviewport");
				}
			});
		}
		//DOM element events
		$(document).ready(function()
		{								   
			//bind event handler
			$(document).bind("dragstart", function() { return false; });
			$(document).keyup(function(e) {
					if(option.keyboard==true)
					{
						  if(e.keyCode == 37) { // left
								seven_current();
						  }
						  else if(e.keyCode == 39) { // right
								seven_next();
						  }	
						  else if(e.keyCode==27)
						  {	
							  handle.find("#seven_sublightbox").animate({
									"opacity":0,
									"scale":0.1,
							  },
							  {
									duration:200,
									easing:"easeOutSine",
									complete:function()
									{
										handle.find("#seven_lightbox").remove();  
									}
							  });
						  }
					}
			});

			var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
			handle.bind(mousewheelevt, function(e){
			
				var evt = window.event || e //equalize event object     
				evt = evt.originalEvent ? evt.originalEvent : evt; //convert to originalEvent if possible               
				var delta = evt.detail ? evt.detail*(-40) : evt.wheelDelta //check for detail first, because it is used by Opera and FF
			
				if(delta > 0) {
					//scroll up
					if(option.scrollmode) seven_next();
				}
				else{
					//scroll down
					if(option.scrollmode) seven_current();
				}   
				return false;
			});

			//navigation button
			handle.find("#left_btn").bind("click", seven_current);
			handle.find("#right_btn").bind("click",	seven_next);
			//mousemove
			handle.find('#seven_viewport').mousedown(function(e){									  
				if(option.swipe==true&&lock==0) 														  
				{
					 mp_temp=[e.pageX,e.pageY];
					 mpflag=1;
					 seven_respond();
					 seven_stop();
					 $(this).addClass("cursor_down");
				}															  
			}).mousemove(function(e){	
				 if(mpflag==1&&lock==0)
				 {
					var offsetx=offsety=0;
					offsetx=e.pageX-mp_temp[0];
					offsety=e.pageY-mp_temp[1];
					//set swipe direction
					if(sd_flag==0)
					{
						sd_flag=(Math.abs(offsetx)>Math.abs(offsety))?1:2;
						if(sd_flag==2)
						{
							handle.find("#seven_prev").css("left","0").css("top","-100%");
							handle.find("#seven_next").css("left","0").css("top","100%");
						}
					}
					//make proper action
					if(sd_flag==1)
						handle.find(".seven_operate").css("marginLeft",offsetx);
					else if(sd_flag==2)
						handle.find(".seven_operate").css("marginTop",offsety);
				 }
			}).mouseup(function(e){
				$(this).removeClass("cursor_down");
				if(lock==1) return;
				seven_swipe_function(new Array(e.pageX,e.pageY));
			}).mouseleave(function(e)
			{
				$(this).removeClass("cursor_down");				
				if(lock==1) return;
				seven_swipe_function(new Array(e.pageX,e.pageY));
			});
			//touch event for swipe
			handle.find("#seven_viewport").on('touchstart',function(e)
			{
				if(option.swipe==true&&lock==0) 														  
				{
					 mp_temp=[e.originalEvent.touches[0].pageX,e.originalEvent.touches[0].pageY];
					 mpflag=1;
					 seven_respond();
					 seven_stop();
				}				
			}).on('touchmove',function(e)
			{
				 if(mpflag==1&&lock==0)
				 {
					var offsetx=offsety=0;
					offsetx=e.originalEvent.changedTouches[0].pageX-mp_temp[0];
					offsety=e.originalEvent.changedTouches[0].pageY-mp_temp[1];
					//set swipe direction
					if(sd_flag==0)
					{
						sd_flag=(Math.abs(offsetx)>Math.abs(offsety))?1:2;
						if(sd_flag==2)
						{
							handle.find("#seven_prev").css("left","0").css("top","-100%");
							handle.find("#seven_next").css("left","0").css("top","100%");
						}
					}
					//make proper action
					if(sd_flag==1)
						handle.find(".seven_operate").css("marginLeft",offsetx);
					else if(sd_flag==2)
						handle.find(".seven_operate").css("marginTop",offsety);
				 }
			}).on('touchend',function(e)
			{
				if(lock==1) return;
				seven_swipe_function(new Array(e.originalEvent.changedTouches[0].pageX,e.originalEvent.changedTouches[0].pageY));				
			});
			handle.on('click','#seven_lbox',function(){seven_lightbox_setup();});
			//preview slide event
			handle.on('mouseover',".seven_circle",function(){ seven_thumb_preview($(this).index());	});	
			//hide slide-preview
			handle.on("mouseleave","#seven_bullet_inner_viewport",function(){ seven_thumb_hide();	});
			//bullet click
			handle.on("click",".seven_circle",function(){ seven_animation($(this).index());	});
			/* auto play button */
			handle.on("click",".seven_a_play",function(){
				  if(!$(this).hasClass("seven_a_pause"))
				  {
						$(this).addClass("seven_a_pause");													
						a_flag=0;
						seven_stop();
				  }
				  else
				  {
						$(this).removeClass("seven_a_pause");													
						if(a_flag==0)
						{
							a_flag=1;						
							if(option.progressbar)
							 	seven_progressbar_setup();							 
						}
						a_flag=1;						
						seven_start();
				  }
			});
			//carousel prev
			handle.on("click",".seven_carousel_nav.cn_left",function()	{	seven_prev_carousel();	});
			//carousel next
			handle.on("click",".seven_carousel_nav.cn_right",function(){	seven_next_carousel();	});
			handle.on("click",".carousel",function(){	c_flag=1; seven_animation($(this).index(),1);});
			
			handle.find(".carousel").on('touchstart',function(e){
				tp_temp=e.originalEvent.touches[0].pageX;
			}).on('touchend',function(e){
				var temp=e.originalEvent.changedTouches[0].pageX;
				if(c_flag==1&&Math.abs(temp-tp_temp)<3)
					seven_animation($(this).index(),1);
			});
			//Carousel swipe
			handle.on('touchstart','.seven_hcarousel',function(e)
			{
				 cr_temp=e.originalEvent.touches[0].pageX;	
				 mp_flag=1;
				 c_flag=0;
			}).on('touchmove',function(e)
			{
				var cache=handle.find("#seven_hviewport");
				var board=handle.find("#seven_hsubboard");
				var width=board.width();
				if(cache.width()<width) return false;
				var offset=e.originalEvent.changedTouches[0].pageX - cr_temp;
				var left=parseInt(board.css("marginLeft"));
				board.css("marginLeft",left+offset);
				
			}).on('touchend',function(e)
			{
				var temp=e.originalEvent.changedTouches[0].pageX;
				mp_flag=0;
				// carousel is less than window width
				if(104*length<option.width)
				{
					handle.find("#seven_hsubboard").animate({
						"marginLeft":0,
					},
					{
						duration:200,
						easing:"easeOutSine"
					});
				}
				if(temp<cr_temp+5&&temp>cr_temp-5)	c_flag=1;
				var cache=handle.find("#seven_hviewport");
				var board=handle.find("#seven_hsubboard");
				if(parseInt(board.css("marginLeft"))>0)
				{
					handle.find("#seven_hsubboard").animate({
					"marginLeft":0,
					},
					{
						duration:200,
						easing:"easeOutSine"
					});
				}
				else if(parseInt(board.css("marginLeft"))+board.width()>cache.width())
				{
					handle.find("#seven_hsubboard").animate({
					"marginLeft":board.width()-cache.width(),
					},
					{
						duration:200,
						easing:"easeOutSine"
					});
				}
			});
			//Carousel swipe
			handle.on("mousemove",".seven_hcarousel",function(e){
				var cache=handle.find("#seven_hviewport");
				var board=handle.find("#seven_hsubboard");
				var width=board.width();
				if(cache.width()<width) return false;
				var offset=e.pageX - handle.find("#seven_viewport").offset().left;
				board.css("marginLeft",-offset*((cache.width()-width)/width));	
			});
			handle.on("mousemove",".seven_vcarousel",function(e){
				var cache=handle.find("#seven_vviewport");
				var board=handle.find("#seven_vsubboard");
				var height=board.height();
				if(cache.height()<height) return false;
				var offset=e.pageY - handle.find("#seven_viewport").offset().top;
				board.css("marginTop",-offset*((cache.height()-height)/height));	
			});
			handle.on('touchstart',function(e)
			{
				 cr_temp=e.originalEvent.touches[0].pageY;	
				 mp_flag=1;
				 c_flag=0;
			}).on('touchmove',function(e)
			{
				var cache=handle.find("#seven_vviewport");
				var board=handle.find("#seven_vsubboard");
				var height=board.height();
				if(cache.height()<height) return false;
				var offset=e.originalEvent.changedTouches[0].pageY - cr_temp;
				var top=parseInt(board.css("marginTop"));
				board.css("marginTop",top+offset);
			}).on('touchend',function(e)
			{
				var temp=e.originalEvent.changedTouches[0].pageY;
				mp_flag=0;
				// carousel is less than window width
				if(80*length<option.height)
				{
					handle.find("#seven_vsubboard").animate({
						"marginTop":0,
					},
					{
						duration:200,
						easing:"easeOutSine"
					});
				}
				if(temp<cr_temp+5&&temp>cr_temp-5)	c_flag=1;
				var cache=handle.find("#seven_vviewport");
				var board=handle.find("#seven_vsubboard");
				if(parseInt(board.css("marginTop"))>0)
				{
					handle.find("#seven_vsubboard").animate({
					"marginTop":0,
					},
					{
						duration:200,
						easing:"easeOutSine"
					});
				}
				else if(parseInt(board.css("marginTop"))+board.height()>cache.height())
				{
					handle.find("#seven_vsubboard").animate({
					"marginTop":board.height()-cache.height(),
					},
					{
						duration:200,
						easing:"easeOutSine"
					});
				}
			});
			/* pause on hover effect */
			handle.mouseover(function()
			{
				if(option.pause_on_hover)
					seven_pause();
				handle.find(".seven_nav").show();
			}).mouseleave(function()
			{
				if(option.pause_on_hover&&a_flag==1)
					seven_start();
				handle.find(".seven_nav").hide();
			});
			//show video play
			handle.on('click','.seven_play',function()
			{
				var temp=$(this).parent().find(".seven_image").attr("data-src");
				$(this).parent().append("<iframe class='seven_video' src='"+temp+"&autoplay=1"+"'></iframe>");
				seven_pause();			
				option.onvideoplay();
			});
			handle.on('click','#seven_lightbox_control_next',function()
			{
				var index=$(".seven_thumb.active").index();	
				index=(index+1)%length;
				seven_lightbox_slide(index);
				seven_lightbox_refresh(1);				
			});
			handle.on('click','#seven_lightbox_control_prev',function()
			{
				var index=$(".seven_thumb.active").index();	
				if(index==0)
					index=length-1;
				else
					index-=1;
				seven_lightbox_slide(index);
				seven_lightbox_refresh(0);
			});
			handle.on('mouseout','#seven_lightbox_thumb',function()
			{
				var cache=handle.find("#seven_lightbox_thumb");
				cache.removeClass("active");
			});
			handle.on('mouseover','#seven_lightbox_thumb',function()
			{
				var cache=handle.find("#seven_lightbox_thumb");
				cache.addClass("active");
			});
			handle.on('click','#seven_lightbox_control_close',function()
			{
				handle.find("#seven_lightbox").animate({
					"opacity":0,
				},
				{
					duration:200,
					easing:"easeOutSine",
					complete:function()
					{
						if(a_flag==1) seven_start();
						handle.find("#seven_lightbox").remove();  
					}
				});
			});
			handle.on('click','.seven_thumb',function(){
				var index=$(this).index();	
				seven_lightbox_slide(index);							  
			});
			handle.on('mousemove','#seven_lightbox_thumb',function(e)
			{
				var cache=handle.find("#seven_subboard");
				var width=handle.find("#seven_thumb_container").width();
				if(width<$(window).width()) return false;
				cache.css("marginLeft",-e.pageX*((width-$(window).width())/$(window).width()));
			});
			handle.on('touchstart','#seven_lightbox_thumb',function(e)
			{
				mp_temp=e.originalEvent.touches[0].pageX;
				mpflag=1;
			});
			handle.on('touchmove','#seven_lightbox_thumb',function(e)
			{
				var cache=handle.find("#seven_subboard");
				var offset=e.originalEvent.changedTouches[0].pageX-mp_temp;
				var left=parseInt(cache.css("marginLeft"));
				cache.css("marginLeft",left+offset);
			});
			handle.on('touchend','#seven_lightbox_thumb',function(e)
			{
				var cache=handle.find("#seven_subboard");
				var left=parseInt(cache.css("marginLeft"));
				if(left>0) cache.animate({marginLeft:0},{duration:200,easing:"easeOutSine"});
				else if(left<$(window).width()-$(this).width()) cache.animate({marginLeft:$(window).width()-$(this).width()},{duration:200,easing:"easeOutSine"});
			});
			$(window).resize(function()
			{
				if(lock==1)		return false;		
				if(option.responsive==true)
				{
					c_flag=0;
					seven_respond();	
				}
				if(a_flag==1)
				{
					seven_stop();
					seven_start();
				}
			});
		});
		//object.prev() function
		superseven.prototype.prev=function()
		{
			seven_current();
		}
		
		//object.next() function
		superseven.prototype.next=function()
		{
			seven_next();
		}
	}
	/*!
	/**
	* Monkey patch jQuery 1.3.1+ to add support for setting or animating CSS
	* scale and rotation independently.
	* https://github.com/zachstronaut/jquery-animate-css-rotate-scale
	* Released under dual MIT/GPL license just like jQuery.
	* 2009-2012 Zachary Johnson www.zachstronaut.com
	*/		
	// Updated 2010.11.06
    // Updated 2012.10.13 - Firefox 16 transform style returns a matrix rather than a string of transform functions. This broke the features of this jQuery patch in Firefox 16. It should be possible to parse the matrix for both scale and rotate (especially when scale is the same for both the X and Y axis), however the matrix does have disadvantages such as using its own units and also 45deg being indistinguishable from 45+360deg. To get around these issues, this patch tracks internally the scale, rotation, and rotation units for any elements that are .scale()'ed, .rotate()'ed, or animated. The major consequences of this are that 1. the scaled/rotated element will blow away any other transform rules applied to the same element (such as skew or translate), and 2. the scaled/rotated element is unaware of any preset scale or rotation initally set by page CSS rules. You will have to explicitly set the starting scale/rotation value.
    
    function initData($el) {
        var _ARS_data = $el.data('_ARS_data');
        if (!_ARS_data) {
            _ARS_data = {
                rotateUnits: 'deg',
                scale: 1,
                rotate: 0
            };
            
            $el.data('_ARS_data', _ARS_data);
        }
        
        return _ARS_data;
    }
    
    function setTransform($el, data) {
        $el.css('transform', 'rotate(' + data.rotate + data.rotateUnits + ') scale(' + data.scale + ',' + data.scale + ')');
    }
    
    $.fn.rotate = function (val) {
        var $self = $(this), m, data = initData($self);
                        
        if (typeof val == 'undefined') {
            return data.rotate + data.rotateUnits;
        }
        
        m = val.toString().match(/^(-?\d+(\.\d+)?)(.+)?$/);
        if (m) {
            if (m[3]) {
                data.rotateUnits = m[3];
            }
            
            data.rotate = m[1];
            
            setTransform($self, data);
        }
        
        return this;
    };
    
    // Note that scale is unitless.
    $.fn.scale = function (val) {
        var $self = $(this), data = initData($self);
        
        if (typeof val == 'undefined') {
            return data.scale;
        }
        
        data.scale = val;
        
        setTransform($self, data);
        
        return this;
    };

    // fx.cur() must be monkey patched because otherwise it would always
    // return 0 for current rotate and scale values
    var curProxied = $.fx.prototype.cur;
    $.fx.prototype.cur = function () {
        if (this.prop == 'rotate') {
            return parseFloat($(this.elem).rotate());
            
        } else if (this.prop == 'scale') {
            return parseFloat($(this.elem).scale());
        }
        
        return curProxied.apply(this, arguments);
    };
    
    $.fx.step.rotate = function (fx) {
        var data = initData($(fx.elem));
        $(fx.elem).rotate(fx.now + data.rotateUnits);
    };
    
    $.fx.step.scale = function (fx) {
        $(fx.elem).scale(fx.now);
    };
    
    /*
	Starting on line 3905 of jquery-1.3.2.js we have this code:
	// We need to compute starting value
	if ( unit != "px" ) {
	self.style[ name ] = (end || 1) + unit;
	start = ((end || 1) / e.cur(true)) * start;
	self.style[ name ] = start + unit;
	}
	This creates a problem where we cannot give units to our custom animation
	because if we do then this code will execute and because self.style[name]
	does not exist where name is our custom animation's name then e.cur(true)
	will likely return zero and create a divide by zero bug which will set
	start to NaN.
	The following monkey patch for animate() gets around this by storing the
	units used in the rotation definition and then stripping the units off.
	*/
    
    var animateProxied = $.fn.animate;
    $.fn.animate = function (prop) {
        if (typeof prop['rotate'] != 'undefined') {
            var $self, data, m = prop['rotate'].toString().match(/^(([+-]=)?(-?\d+(\.\d+)?))(.+)?$/);
            if (m && m[5]) {
                $self = $(this);
                data = initData($self);
                data.rotateUnits = m[5];
            }
            
            prop['rotate'] = m[1];
        }
        
        return animateProxied.apply(this, arguments);
    };
	
	// Monkey patch jQuery 1.3.1+ css() method to support CSS 'transform'
    // property uniformly across Safari/Chrome/Webkit, Firefox 3.5+, IE 9+, and Opera 11+.
    // 2009-2011 Zachary Johnson www.zachstronaut.com
    // Updated 2011.05.04 (May the fourth be with you!)
    function getTransformProperty(element)
    {
        // Try transform first for forward compatibility
        // In some versions of IE9, it is critical for msTransform to be in
        // this list before MozTranform.
        var properties = ['transform', 'WebkitTransform', 'msTransform', 'MozTransform', 'OTransform'];
        var p;
        while (p = properties.shift())
        {
            if (typeof element.style[p] != 'undefined')
            {
                return p;
            }
        }
        
        // Default to transform also
        return 'transform';
    }
    
    var _propsObj = null;
    
    var proxied = $.fn.css;
    $.fn.css = function (arg, val)
    {
        // Temporary solution for current 1.6.x incompatibility, while
        // preserving 1.3.x compatibility, until I can rewrite using CSS Hooks
        if (_propsObj === null)
        {
            if (typeof $.cssProps != 'undefined')
            {
                _propsObj = $.cssProps;
            }
            else if (typeof $.props != 'undefined')
            {
                _propsObj = $.props;
            }
            else
            {
                _propsObj = {}
            }
        }
        
        // Find the correct browser specific property and setup the mapping using
        // $.props which is used internally by jQuery.attr() when setting CSS
        // properties via either the css(name, value) or css(properties) method.
        // The problem with doing this once outside of css() method is that you
        // need a DOM node to find the right CSS property, and there is some risk
        // that somebody would call the css() method before body has loaded or any
        // DOM-is-ready events have fired.
        if
        (
            typeof _propsObj['transform'] == 'undefined'
            &&
            (
                arg == 'transform'
                ||
                (
                    typeof arg == 'object'
                    && typeof arg['transform'] != 'undefined'
                )
            )
        )
        {
            _propsObj['transform'] = getTransformProperty(this.get(0));
        }
        
        // We force the property mapping here because jQuery.attr() does
        // property mapping with jQuery.props when setting a CSS property,
        // but curCSS() does *not* do property mapping when *getting* a
        // CSS property. (It probably should since it manually does it
        // for 'float' now anyway... but that'd require more testing.)
        //
        // But, only do the forced mapping if the correct CSS property
        // is not 'transform' and is something else.
        if (_propsObj['transform'] != 'transform')
        {
            // Call in form of css('transform' ...)
            if (arg == 'transform')
            {
                arg = _propsObj['transform'];
                
                // User wants to GET the transform CSS, and in jQuery 1.4.3
                // calls to css() for transforms return a matrix rather than
                // the actual string specified by the user... avoid that
                // behavior and return the string by calling jQuery.style()
                // directly
                if (typeof val == 'undefined' && jQuery.style)
                {
                    return jQuery.style(this.get(0), arg);
                }
            }

            // Call in form of css({'transform': ...})
            else if
            (
                typeof arg == 'object'
                && typeof arg['transform'] != 'undefined'
            )
            {
                arg[_propsObj['transform']] = arg['transform'];
                delete arg['transform'];
            }
        }
        
        return proxied.apply(this, arguments);
    };
})(jQuery);