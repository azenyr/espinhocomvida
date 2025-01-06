import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page404',
  imports: [MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './page404.component.html',
  styleUrl: './page404.component.scss',
})
export class Page404Component {
  refreshPage() {
    window.location.reload();
  }
}
