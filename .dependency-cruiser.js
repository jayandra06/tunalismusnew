module.exports = {
  forbidden: [],
  allowed: [],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    exclude: {
      path: '\\.(css|scss|sass|less)$'
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
        theme: {
          graph: {
            splines: 'ortho'
          },
          modules: [
            {
              criteria: { matchesFocus: true },
              attributes: {
                fillcolor: 'lime',
                penwidth: 2
              }
            },
            {
              criteria: { matchesNotFocus: true },
              attributes: {
                fillcolor: 'lightgrey'
              }
            }
          ]
        }
      }
    }
  }
};
