import React from "react";

// Composant Hero - Réseau Alumni Géolocalisé avec coucher de soleil
const HeroSunset = () => {
  // Coordonnées des villes sur la carte du Maroc pour le réseau
  const networkNodes = [
    { x: 45, y: 35 }, // Rabat
    { x: 42, y: 48 }, // Casablanca
    { x: 48, y: 55 }, // Marrakech
    { x: 52, y: 38 }, // Fès
    { x: 40, y: 25 }, // Tanger
    { x: 35, y: 58 }, // Agadir
  ];

  // Générer les lignes de connexion du réseau
  const networkLines = [];
  networkNodes.forEach((node1, i) => {
    networkNodes.slice(i + 1).forEach((node2) => {
      networkLines.push({ x1: node1.x, y1: node1.y, x2: node2.x, y2: node2.y });
    });
  });

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '700px' }}>
      <svg
        viewBox="0 0 1200 700"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient pour le ciel */}
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#FFE5B4", stopOpacity: 1 }} />
            <stop offset="30%" style={{ stopColor: "#FFB347", stopOpacity: 1 }} />
            <stop offset="60%" style={{ stopColor: "#FF8C42", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#8B4513", stopOpacity: 1 }} />
          </linearGradient>

          {/* Gradient pour le sol */}
          <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#2F4F4F", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#1C3A3A", stopOpacity: 1 }} />
          </linearGradient>

          {/* Gradient pour les montagnes */}
          <linearGradient id="mountainGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#D2691E", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#A0522D", stopOpacity: 1 }} />
          </linearGradient>

          <linearGradient id="mountainGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#CD853F", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#8B4513", stopOpacity: 1 }} />
          </linearGradient>

          {/* Glow pour le réseau orange */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ciel avec dégradé */}
        <rect width="1200" height="560" fill="url(#skyGradient)" />

        {/* Soleil */}
        <circle cx="500" cy="500" r="80" fill="#FFD700" opacity="0.9">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Rayons de soleil */}
        <g opacity="0.7">
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * Math.PI / 180;
            const length = 120;
            const x1 = 500 + 80 * Math.cos(angle);
            const y1 = 500 + 80 * Math.sin(angle);
            const x2 = 500 + length * Math.cos(angle);
            const y2 = 500 + length * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FFD700"
                strokeWidth="4"
                strokeLinecap="round"
              >
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
              </line>
            );
          })}
        </g>

        {/* Montagnes en couches */}
        <g opacity="0.8">
          {/* Montagne arrière */}
          <path
            d="M 0 450 L 200 380 L 400 400 L 600 350 L 800 380 L 1000 400 L 1200 420 L 1200 560 L 0 560 Z"
            fill="url(#mountainGrad2)"
          />
          {/* Montagne moyenne */}
          <path
            d="M 0 480 L 150 420 L 350 440 L 550 390 L 750 420 L 950 440 L 1200 460 L 1200 560 L 0 560 Z"
            fill="url(#mountainGrad1)"
          />
          {/* Montagne avant */}
          <path
            d="M 0 510 L 100 460 L 300 480 L 500 430 L 700 460 L 900 480 L 1200 500 L 1200 560 L 0 560 Z"
            fill="#8B4513"
          />
        </g>

        {/* Sol avec silhouettes */}
        <rect x="0" y="560" width="1200" height="140" fill="url(#groundGradient)" />

        {/* Silhouettes de personnes (15-20 personnes) */}
        <g fill="#2F4F4F" opacity="0.9">
          {/* Personne avec bras tendu (gauche) */}
          <path d="M 80 540 L 75 500 L 70 480 L 75 460 L 80 440 L 85 460 L 90 500 L 85 540 Z M 70 480 L 60 470 L 55 480" />
          
          {/* Groupe de personnes au centre */}
          {[
            { x: 200, head: 450, height: 90 },
            { x: 250, head: 460, height: 80 },
            { x: 300, head: 455, height: 85 },
            { x: 350, head: 465, height: 75 },
            { x: 400, head: 450, height: 90 },
            { x: 450, head: 460, height: 80 },
            { x: 500, head: 455, height: 85 },
            { x: 550, head: 465, height: 75 },
            { x: 600, head: 450, height: 90 },
            { x: 650, head: 460, height: 80 },
            { x: 700, head: 455, height: 85 },
            { x: 750, head: 465, height: 75 },
            { x: 800, head: 450, height: 90 },
            { x: 850, head: 460, height: 80 },
          ].map((person, i) => {
            const isPointing = i === 5;
            const hasBag = i === 8;
            const isDress = i === 10;
            
            return (
              <g key={i}>
                {/* Tête */}
                <ellipse cx={person.x} cy={person.head} rx="8" ry="10" />
                {/* Corps */}
                <path
                  d={`M ${person.x - 6} ${person.head + 10} 
                      Q ${person.x - 8} ${person.head + person.height / 2} 
                      ${person.x - 4} ${person.head + person.height} 
                      L ${person.x + 4} ${person.head + person.height} 
                      Q ${person.x + 8} ${person.head + person.height / 2} 
                      ${person.x + 6} ${person.head + 10} Z`}
                />
                {/* Bras pointant */}
                {isPointing && (
                  <path d={`M ${person.x + 6} ${person.head + 25} L ${person.x + 15} ${person.head + 20}`} stroke="#2F4F4F" strokeWidth="3" fill="none" />
                )}
                {/* Sac */}
                {hasBag && (
                  <rect x={person.x + 8} y={person.head + 30} width="6" height="10" rx="2" />
                )}
                {/* Robe */}
                {isDress && (
                  <path d={`M ${person.x - 6} ${person.head + 30} L ${person.x} ${person.head + person.height} L ${person.x + 6} ${person.head + 30} Z`} />
                )}
              </g>
            );
          })}

          {/* Personne avec cheveux (queue de cheval) */}
          <g transform="translate(350, 460)">
            <ellipse cx="0" cy="0" rx="8" ry="10" />
            <path d="M -8 -5 Q -10 -8 -8 -12" stroke="#2F4F4F" strokeWidth="2" fill="none" />
          </g>
        </g>

        {/* Carte du Maroc en surimpression (haut droite) */}
        <g transform="translate(650, 50)">
          {/* Fond de la carte */}
          <path
            d="M 50 80 
               L 120 60 
               L 180 70 
               L 250 90 
               L 300 130 
               L 320 180 
               L 310 230 
               L 320 280 
               L 300 330 
               L 250 360 
               L 200 370 
               L 140 360 
               L 80 340 
               L 40 310 
               L 30 270 
               L 40 230 
               L 60 200 
               L 80 170 
               L 70 140 
               L 50 110 
               Z"
            fill="#DC143C"
            opacity="0.85"
            stroke="#B22222"
            strokeWidth="2"
          />

          {/* Réseau orange avec glow */}
          <g filter="url(#glow)" opacity="0.9">
            {/* Lignes du réseau */}
            {networkLines.map((line, i) => (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#FF8C00"
                strokeWidth="2"
                opacity="0.8"
              >
                <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
              </line>
            ))}

            {/* Nœuds orange */}
            {networkNodes.map((node, i) => (
              <circle
                key={i}
                cx={node.x}
                cy={node.y}
                r="4"
                fill="#FF8C00"
              >
                <animate attributeName="r" values="3;5;3" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}

            {/* Étoiles vertes (points importants) */}
            <g transform="translate(180, 200)">
              <path
                d="M 0 -10 L 3 -3 L 10 -3 L 4 2 L 6 9 L 0 5 L -6 9 L -4 2 L -10 -3 L -3 -3 Z"
                fill="#00FF00"
                stroke="#008000"
                strokeWidth="1"
              />
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
            </g>

            <g transform="translate(100, 280)">
              <path
                d="M 0 -8 L 2.5 -2.5 L 8 -2.5 L 3.5 1.5 L 5 7 L 0 4 L -5 7 L -3.5 1.5 L -8 -2.5 L -2.5 -2.5 Z"
                fill="#00FF00"
                stroke="#008000"
                strokeWidth="1"
              />
            </g>

            {/* Grande étoile verte centrale (symbole du Maroc) */}
            <g transform="translate(180, 200)">
              <path
                d="M 0 -15 L 4.5 -4.5 L 15 -4.5 L 6 3 L 9 14 L 0 7 L -9 14 L -6 3 L -15 -4.5 L -4.5 -4.5 Z"
                fill="#00FF00"
                stroke="#008000"
                strokeWidth="2"
              />
            </g>
          </g>

          {/* Labels de villes (faint) */}
          <text x="100" y="280" fontSize="10" fill="white" opacity="0.5" fontFamily="Arial">Rabat</text>
          <text x="95" y="300" fontSize="10" fill="white" opacity="0.5" fontFamily="Arial">Casablanca</text>
          <text x="115" y="315" fontSize="10" fill="white" opacity="0.5" fontFamily="Arial">Marrakech</text>
          <text x="130" y="250" fontSize="10" fill="white" opacity="0.5" fontFamily="Arial">Fes</text>
          <text x="85" y="220" fontSize="10" fill="white" opacity="0.5" fontFamily="Arial">Tanger</text>
          <text x="75" y="330" fontSize="10" fill="white" opacity="0.5" fontFamily="Arial">Agadir</text>
        </g>

        {/* Texte "Geolocated Alumni Network" (haut gauche) */}
        <text
          x="80"
          y="80"
          fontSize="36"
          fontWeight="bold"
          fill="white"
          fontFamily="Arial, sans-serif"
          opacity="0.95"
        >
          Geolocated
        </text>
        <text
          x="80"
          y="115"
          fontSize="36"
          fontWeight="bold"
          fill="#FFB6C1"
          fontFamily="Arial, sans-serif"
          opacity="0.9"
        >
          Alumni Network
        </text>

        {/* Interactions des rayons avec le réseau */}
        <g opacity="0.4">
          {[...Array(6)].map((_, i) => {
            const angle = (i * 30 + 150) * Math.PI / 180;
            const x1 = 500 + 80 * Math.cos(angle);
            const y1 = 500 + 80 * Math.sin(angle);
            const x2 = 680 + (i % 3) * 20;
            const y2 = 150 + (i % 2) * 30;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FFD700"
                strokeWidth="2"
                opacity="0.3"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default HeroSunset;
