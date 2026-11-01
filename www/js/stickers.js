/* Layer-scoped sticker tool, using the existing current_tool='transform' stage. */
(function () {
  const library = document.getElementById('stickerLibrary');
  const grid = document.getElementById('stickerGrid');
  const upload = document.getElementById('stickerUpload');
  const stickerAssets = [
    { name: 'Brush', src: 'assets/brush/default.png' },
    { name: 'Brush 2', src: 'assets/brush/default 2.png' },
    { name: 'X Brush', src: 'assets/brush/Xbrush.png' },
    { name: 'Tree', src: 'assets/brush/tree.png' },
    { name: 'Grass', src: 'assets/brush/grass.png' },
    { name: 'Water', src: 'assets/brush/waterSimply.png' }
  ];
  let activeTransformer = null;
  let activeStickerLayer = null;
  let selectedStickerNode = null;

  function selectedLayerGroup() {
    const page = pages && pages['page' + currentpage];
    if (!page || !page.layers || !page.layers[currentlayer]) return null;
    return page.layers[currentlayer].draw;
  }

  function ensureTransformer() {
    if (!layer) return null;
    if (activeTransformer && activeStickerLayer === layer) return activeTransformer;
    if (activeTransformer) activeTransformer.destroy();
    activeStickerLayer = layer;
    activeTransformer = new Konva.Transformer({
      rotateEnabled: true,
      keepRatio: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      boundBoxFunc: function (oldBox, newBox) {
        if (newBox.width < 12 || newBox.height < 12) return oldBox;
        return newBox;
      }
    });
    layer.add(activeTransformer);
    activeTransformer.hide();
    return activeTransformer;
  }

  function addSticker(src) {
    const targetGroup = selectedLayerGroup();
    if (!targetGroup || !layer) {
      alert('Selecione uma layer antes de adicionar um sticker.');
      return;
    }
    const image = new Image();
    image.onload = function () {
      const ratio = Math.min(1, 128 / image.width, 128 / image.height);
      const width = Math.max(1, image.width * ratio);
      const height = Math.max(1, image.height * ratio);
      const node = new Konva.Image({
        x: Math.max(0, (DRAWSIZE.width - width) / 2),
        y: Math.max(0, (DRAWSIZE.height - height) / 2),
        image: image,
        width: width,
        height: height,
        draggable: true,
        name: 'manga-sticker',
        listening: true
      });
      targetGroup.add(node);
      const transformer = ensureTransformer();
      selectedStickerNode = node;
      transformer.nodes([node]);
      transformer.show();
      transformer.moveToTop();
      set_current_tool('transform');
      isSaved = false;
      layer.batchDraw();
      stage.batchDraw();
      closeStickerLibrary();
    };
    image.onerror = function () { alert('Não foi possível carregar esta imagem.'); };
    image.src = src;
  }

  window.openStickerLibrary = function () {
    set_current_tool('transform');
    grid.innerHTML = '';
    stickerAssets.forEach(function (asset) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'sticker-item';
      const img = document.createElement('img');
      img.src = asset.src;
      img.alt = asset.name;
      const caption = document.createElement('span');
      caption.textContent = asset.name;
      button.append(img, caption);
      button.addEventListener('click', function () { addSticker(asset.src); });
      grid.appendChild(button);
    });
    library.style.display = 'flex';
  };

  window.closeStickerLibrary = function () { library.style.display = 'none'; };

  window.syncStickerTransformMode = function () {
    const enabled = current_tool === 'transform';
    const page = pages && pages['page' + currentpage];
    if (page && page.layers) {
      page.layers.forEach(function (entry) {
        if (entry.draw) entry.draw.find('.manga-sticker').forEach(function (node) {
          node.draggable(enabled);
        });
      });
    }
    if (activeTransformer) {
      if (enabled && selectedStickerNode && selectedStickerNode.getLayer() === layer) {
        activeTransformer.nodes([selectedStickerNode]);
        activeTransformer.show();
      } else {
        activeTransformer.hide();
      }
    }
    if (stage) stage.batchDraw();
  };

  upload.addEventListener('change', function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    addSticker(URL.createObjectURL(file));
    upload.value = '';
  });

  stage.on('click tap', function (event) {
    if (current_tool !== 'transform') return;
    const target = event.target;
    if (!target || !target.hasName || !target.hasName('manga-sticker')) {
      if (activeTransformer) activeTransformer.hide();
      stage.batchDraw();
      return;
    }
    const ownerLayer = target.getLayer();
    if (ownerLayer !== layer) {
      if (activeTransformer) activeTransformer.hide();
      return;
    }
    const transformer = ensureTransformer();
    selectedStickerNode = target;
    transformer.nodes([target]);
    transformer.show();
    transformer.moveToTop();
    ownerLayer.batchDraw();
  });
})();