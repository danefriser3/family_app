import React from 'react'

const MuiIconStub: React.FC<{ 'data-testid'?: string } & React.SVGProps<SVGSVGElement>> = (props) => (
  <svg data-testid={props['data-testid'] || 'mui-icon-stub'} width="1em" height="1em" />
)

export default MuiIconStub
