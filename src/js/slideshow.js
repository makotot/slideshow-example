/**
 * スライドショーオブジェクト
 *
 * @class slideshow
 *
 */
var slideshow = {

  /**
   * スライドショーのラッパー要素
   *
   * @property $wrapper
   * @type { Object } jQueryオブジェクト
   *
   */
  $wrapper: $('#js-slideshow'),

  /**
   * JSONから取得した画像情報を格納する配列
   *
   * @property images
   * @type { Array }
   *
   */
  images: [],

  /**
   * 画像を取得して、HTMLを生成するメソッドを呼び出す
   *
   * @method loadImages
   *
   */
  loadImages: function () {

    $.ajax('./json/images.json', {
    }).done(function (response) {
      this.images = this.getImages(response);
      this.createSlideHTML(this.images);
      this.createIndicatorHTML(this.images);
    }.bind(this));
  },

  /**
   * JSONから取得した画像情報を配列で返す
   *
   * @method getImages
   * @param response { String } JSONデータ
   * @return { Array }
   */
  getImages: function (response) {
    var images = [];

    for (var i = 0, max = response.length; i < max; i++) {
      images.push(response[i]);
    }

    return images;
  },

  /**
   * スライドする画像のリスト要素を生成してHTMLに挿入する
   *
   * @method createSlideHTML
   * @param images { Array } 画像情報の配列
   *
   */
  createSlideHTML: function (images) {
    var $list = this.$wrapper.find('.js-slideshow__list'),
      template = '';

    for (var i = 0, max = images.length; i < max; i++) {
      template += '<li>';
      template += '<img src="';
      template += images[i].url;
      template += '" />';
      template += '</li>';
    }

    $list.append(template);
    this.updateListStyle();
  },

  /**
   * インジケータの要素を生成してHTMLに挿入する
   *
   * @method createIndicatorHTML
   * @param images { Array } 画像情報の配列
   *
   */
  createIndicatorHTML: function (images) {
    var $indicatorList = this.$wrapper.find('.js-slideshow__indicator-list'),
      template = '';

    for (var i = 0, max = images.length; i < max; i++) {
      template += '<li';
      template += (i !== 0) ? '>' : ' class="is-active">';
      template += '<a href="#">';
      template += '</a>'
      template += '</li>';
    }

    $indicatorList.append(template);
  },

  /**
   * 挿入された画像リストの要素に応じて、親要素のwidthを更新する
   *
   * @method updateListStyle
   *
   */
  updateListStyle: function () {
    var $list = this.$wrapper.find('.js-slideshow__list'),
      totalWidth = this.getTotalImageWidth();

    $list.css({
      width: totalWidth
    });
  },

  /**
   * 自動でスライドする間隔
   *
   * @property interval
   * @type { Number }
   *
   */
  interval: 3000,

  /**
   * 自動スライドを開始する
   *
   * @method play
   *
   */
  play: function () {
    var that = this;

    this.runner = setTimeout(function () {
      that.slide(null, true, null);
      that.play();
    }, this.interval);

  },

  /**
   * 自動スライドを停止する
   *
   * @method pause
   *
   */
  pause: function () {
    clearTimeout(this.runner);
    this.runner = null;
  },

  /**
   * 全画像の合計幅を返す
   *
   * @method getTotalImageWidth
   * @return { Number } 全画像の合計幅
   *
   */
  getTotalImageWidth: function () {
    var total = 0;

    for (var i = 0, max = this.images.length; i < max; i++) {
      total += (this.images[i].width * 1);
    }

    return total;
  },

  /**
   * 画像リストをスライドする
   *
   * @method slide
   * @param indicatorItem { Object } イベントターゲットのインジケータ要素。インジケータ以外がイベントターゲットの場合、null。
   * @param isNext { Boolean } スライドする方向が右か左か。右ならtrue。
   * @param controller { Object } イベントターゲットのコントローラ要素。コントローラ以外がイベントターゲットの場合、null。
   *
   */
  slide: function (indicatorItem, isNext, controller) {
    var $list = this.$wrapper.find('.js-slideshow__list'),
      $items = $list.children('li'),
      listItemWidth = $items.eq(0).width(),
      currentPos = (($list.css('margin-left')).split('px')[0]) * 1;

    if ($list.is(':animated')) {
      return;
    }

    var $controller = $(controller);

    if (controller && $controller && $controller.hasClass('is-disabled')) {
      return;
    }


    var newPos = isNext ? (currentPos - listItemWidth) : (currentPos + listItemWidth);

    if (!controller && this.$wrapper.find('.js-slideshow__controller--next').hasClass('is-disabled')) {
      newPos = 0;
    }

    if (indicatorItem) {
      newPos = -($(indicatorItem).closest('li').index() * (this.images[0].width * 1));
    }

    $list
      .stop()
      .animate({
        marginLeft: newPos
      }, 300);

    this.updateControllerState(newPos);
    this.updateIndicatorState(newPos);
  },

  /**
   * コントローラーの活性、非活性状態を更新する
   *
   * @method updateControllerState
   * @param pos { Number } スライドで移動する先のmarginLeftの値。
   *
   */
  updateControllerState: function (pos) {
    var $controllerPrev = this.$wrapper.find('.js-slideshow__controller--prev'),
      $controllerNext = this.$wrapper.find('.js-slideshow__controller--next');

    $controllerPrev.toggleClass('is-disabled', pos === 0);
    $controllerNext.toggleClass('is-disabled', pos === -((this.images.length - 1) * (this.images[0].width * 1)));
  },

  /**
   * インジケータのアクティブクラスを更新する
   *
   * @method udpateIndicatorState
   * @param pos { Number } スライドで移動する先のmarginLeftの値。
   */
  updateIndicatorState: function (pos) {
    var $indicatorList = this.$wrapper.find('.js-slideshow__indicator-list'),
      $items = $indicatorList.children('li'),
      $activeItem = $indicatorList.find('.is-active'),
      index = Math.abs((pos / (this.images[0].width * 1)));

    $activeItem.removeClass('is-active');
    $items.eq(index).addClass('is-active');
  }

};


$(function () {

  slideshow.loadImages();

  $(window).on('load', function () {
    slideshow.play();
  });

  slideshow.$wrapper
    .on('click', '.js-slideshow__controller--prev', function (e) {
      e.preventDefault();
      slideshow.slide(null, false, this);
    })
    .on('click', '.js-slideshow__controller--next', function (e) {
      e.preventDefault();
      slideshow.slide(null, true, this);
    })
    .on('mouseenter', function () {
      slideshow.pause();
    })
    .on('mouseleave', function () {
      slideshow.play();
    })
    .on('click', '.js-slideshow__indicator-list > li > a', function (e) {
      e.preventDefault();
      slideshow.slide(this, null, null);
    });
});

